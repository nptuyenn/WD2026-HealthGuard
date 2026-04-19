import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { TCMR_SCHEDULE, scheduledDateFromDob } from "../lib/tcmr";

export const vaccinationsRouter = Router({ mergeParams: true });

const vaccinationInput = z.object({
  vaccineCode: z.string().min(1).max(50),
  vaccineName: z.string().min(1).max(100),
  doseNumber: z.number().int().min(1).max(10).optional(),
  ageGroup: z.string().max(50).optional().nullable(),
  scheduledDate: z.string().datetime(),
  administeredAt: z.string().datetime().optional().nullable(),
  status: z.enum(["pending", "completed", "overdue", "skipped"]).optional(),
  notes: z.string().max(500).optional().nullable(),
});

async function assertOwnedProfile(userId: string, profileId: string) {
  const profile = await prisma.healthProfile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) throw new HttpError(404, "Profile not found");
  return profile;
}

vaccinationsRouter.use(requireAuth);

vaccinationsRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const list = await prisma.vaccination.findMany({
      where: { profileId },
      orderBy: { scheduledDate: "asc" },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

vaccinationsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const data = vaccinationInput.parse(req.body);
    const row = await prisma.vaccination.create({
      data: {
        profileId,
        vaccineCode: data.vaccineCode,
        vaccineName: data.vaccineName,
        doseNumber: data.doseNumber ?? 1,
        ageGroup: data.ageGroup ?? null,
        scheduledDate: new Date(data.scheduledDate),
        administeredAt: data.administeredAt ? new Date(data.administeredAt) : null,
        status: data.status ?? "pending",
        notes: data.notes ?? null,
      },
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

vaccinationsRouter.patch("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const id = String(req.params.id);
    const existing = await prisma.vaccination.findFirst({ where: { id, profileId } });
    if (!existing) throw new HttpError(404, "Vaccination not found");
    const data = vaccinationInput.partial().parse(req.body);
    const row = await prisma.vaccination.update({
      where: { id },
      data: {
        ...(data.vaccineCode !== undefined && { vaccineCode: data.vaccineCode }),
        ...(data.vaccineName !== undefined && { vaccineName: data.vaccineName }),
        ...(data.doseNumber !== undefined && { doseNumber: data.doseNumber }),
        ...(data.ageGroup !== undefined && { ageGroup: data.ageGroup }),
        ...(data.scheduledDate !== undefined && { scheduledDate: new Date(data.scheduledDate) }),
        ...(data.administeredAt !== undefined && {
          administeredAt: data.administeredAt ? new Date(data.administeredAt) : null,
        }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

vaccinationsRouter.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const id = String(req.params.id);
    const existing = await prisma.vaccination.findFirst({ where: { id, profileId } });
    if (!existing) throw new HttpError(404, "Vaccination not found");
    await prisma.vaccination.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

vaccinationsRouter.post("/seed-tcmr", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    const profile = await assertOwnedProfile(req.userId!, profileId);
    if (!profile.dob) throw new HttpError(400, "Hồ sơ chưa có ngày sinh");

    const existing = await prisma.vaccination.findMany({ where: { profileId } });
    const existingKeys = new Set(existing.map((v) => `${v.vaccineCode}:${v.doseNumber}`));

    const now = new Date();
    const toCreate = TCMR_SCHEDULE.filter(
      (t) => !existingKeys.has(`${t.vaccineCode}:${t.doseNumber}`)
    ).map((t) => {
      const scheduledDate = scheduledDateFromDob(profile.dob!, t.ageMonths);
      return {
        profileId,
        vaccineCode: t.vaccineCode,
        vaccineName: t.vaccineName,
        doseNumber: t.doseNumber,
        ageGroup: t.ageGroup,
        scheduledDate,
        status: scheduledDate < now ? "overdue" : "pending",
      };
    });

    if (toCreate.length > 0) {
      await prisma.vaccination.createMany({ data: toCreate });
    }

    const list = await prisma.vaccination.findMany({
      where: { profileId },
      orderBy: { scheduledDate: "asc" },
    });
    res.json({ created: toCreate.length, vaccinations: list });
  } catch (err) {
    next(err);
  }
});
