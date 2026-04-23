import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";

export const medicationsRouter = Router({ mergeParams: true });

const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM");

const scheduleInput = z.object({
  timesOfDay: z.array(timeOfDay).min(1).max(8),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  startsOn: z.string().datetime().optional(),
  endsOn: z.string().datetime().optional().nullable(),
});

const medicationInput = z.object({
  name: z.string().min(1).max(100),
  dosage: z.string().max(50).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
  instructions: z.string().max(500).optional().nullable(),
  stockTotal: z.number().int().min(0).optional().nullable(),
  stockRemaining: z.number().int().min(0).optional().nullable(),
  lowStockThreshold: z.number().int().min(0).optional(),
  expiryDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
  schedules: z.array(scheduleInput).optional(),
});

async function assertOwnedProfile(userId: string, profileId: string) {
  const profile = await prisma.healthProfile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) throw new HttpError(404, "Profile not found");
  return profile;
}

async function assertOwnedMedication(userId: string, profileId: string, medId: string) {
  const med = await prisma.medication.findFirst({
    where: { id: medId, profileId, profile: { userId } },
  });
  if (!med) throw new HttpError(404, "Medication not found");
  return med;
}

function toDate(v?: string | null) {
  return v ? new Date(v) : null;
}

medicationsRouter.use(requireAuth);

medicationsRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const meds = await prisma.medication.findMany({
      where: { profileId },
      include: { schedules: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(meds);
  } catch (err) {
    next(err);
  }
});

medicationsRouter.get("/today", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);

    const dateParam = typeof req.query.date === "string" ? req.query.date : null;
    const target = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? new Date(`${dateParam}T00:00:00.000Z`)
      : new Date();
    const todayStr = target.toISOString().slice(0, 10);
    const dayOfWeek = target.getUTCDay();

    const meds = await prisma.medication.findMany({
      where: {
        profileId,
        isActive: true,
        schedules: { some: {} },
      },
      include: { schedules: true },
    });

    const scheduleIds = meds.flatMap((m) => m.schedules.map((s) => s.id));
    const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${todayStr}T23:59:59.999Z`);

    const logs = await prisma.medicationLog.findMany({
      where: {
        scheduleId: { in: scheduleIds },
        scheduledAt: { gte: startOfDay, lte: endOfDay },
      },
    });
    const logByKey = new Map<string, typeof logs[number]>();
    for (const log of logs) {
      logByKey.set(`${log.scheduleId}:${log.scheduledAt.toISOString().slice(11, 16)}`, log);
    }

    type Event = {
      eventKey: string;
      scheduleId: string;
      medicationId: string;
      medicationName: string;
      dosage: string | null;
      unit: string | null;
      instructions: string | null;
      scheduledDate: string;
      scheduledTime: string;
      scheduledAt: string;
      logId: string | null;
      status: "pending" | "taken" | "missed" | "skipped";
      takenAt: string | null;
    };

    const events: Event[] = [];
    for (const med of meds) {
      for (const sch of med.schedules) {
        const activeToday =
          (sch.daysOfWeek.length === 0 || sch.daysOfWeek.includes(dayOfWeek)) &&
          sch.startsOn <= endOfDay &&
          (!sch.endsOn || sch.endsOn >= startOfDay);
        if (!activeToday) continue;

        for (const t of sch.timesOfDay) {
          const log = logByKey.get(`${sch.id}:${t}`);
          const scheduledAt = new Date(`${todayStr}T${t}:00.000Z`);
          events.push({
            eventKey: `${sch.id}:${todayStr}T${t}`,
            scheduleId: sch.id,
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            unit: med.unit,
            instructions: med.instructions,
            scheduledDate: todayStr,
            scheduledTime: t,
            scheduledAt: scheduledAt.toISOString(),
            logId: log?.id ?? null,
            status: (log?.status as Event["status"]) ?? "pending",
            takenAt: log?.takenAt?.toISOString() ?? null,
          });
        }
      }
    }

    events.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    res.json(events);
  } catch (err) {
    next(err);
  }
});

medicationsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);

    const data = medicationInput.parse(req.body);
    const med = await prisma.medication.create({
      data: {
        profileId,
        name: data.name,
        dosage: data.dosage ?? null,
        unit: data.unit ?? null,
        instructions: data.instructions ?? null,
        stockTotal: data.stockTotal ?? null,
        stockRemaining: data.stockRemaining ?? null,
        lowStockThreshold: data.lowStockThreshold ?? 5,
        expiryDate: toDate(data.expiryDate),
        startDate: toDate(data.startDate),
        endDate: toDate(data.endDate),
        isActive: data.isActive ?? true,
        schedules: data.schedules
          ? {
              create: data.schedules.map((s) => ({
                timesOfDay: s.timesOfDay,
                daysOfWeek: s.daysOfWeek ?? [],
                startsOn: toDate(s.startsOn) ?? new Date(),
                endsOn: toDate(s.endsOn ?? null),
              })),
            }
          : undefined,
      },
      include: { schedules: true },
    });
    res.status(201).json(med);
  } catch (err) {
    next(err);
  }
});

medicationsRouter.patch("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    const medId = String(req.params.id);
    await assertOwnedMedication(req.userId!, profileId, medId);

    const data = medicationInput.partial().parse(req.body);
    const med = await prisma.medication.update({
      where: { id: medId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.dosage !== undefined && { dosage: data.dosage }),
        ...(data.unit !== undefined && { unit: data.unit }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.stockTotal !== undefined && { stockTotal: data.stockTotal }),
        ...(data.stockRemaining !== undefined && { stockRemaining: data.stockRemaining }),
        ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
        ...(data.expiryDate !== undefined && { expiryDate: toDate(data.expiryDate) }),
        ...(data.startDate !== undefined && { startDate: toDate(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: toDate(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: { schedules: true },
    });
    res.json(med);
  } catch (err) {
    next(err);
  }
});

medicationsRouter.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    const medId = String(req.params.id);
    await assertOwnedMedication(req.userId!, profileId, medId);
    await prisma.medication.delete({ where: { id: medId } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

medicationsRouter.post("/:id/schedules", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    const medId = String(req.params.id);
    await assertOwnedMedication(req.userId!, profileId, medId);

    const data = scheduleInput.parse(req.body);
    const schedule = await prisma.medicationSchedule.create({
      data: {
        medicationId: medId,
        timesOfDay: data.timesOfDay,
        daysOfWeek: data.daysOfWeek ?? [],
        startsOn: toDate(data.startsOn) ?? new Date(),
        endsOn: toDate(data.endsOn ?? null),
      },
    });
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
});

medicationsRouter.delete("/:id/schedules/:sid", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    const medId = String(req.params.id);
    const sid = String(req.params.sid);
    await assertOwnedMedication(req.userId!, profileId, medId);
    const owned = await prisma.medicationSchedule.findFirst({
      where: { id: sid, medicationId: medId },
    });
    if (!owned) throw new HttpError(404, "Schedule not found");
    await prisma.medicationSchedule.delete({ where: { id: sid } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
