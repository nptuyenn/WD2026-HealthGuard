import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";

export const clinicVisitsRouter = Router({ mergeParams: true });

async function assertOwnedProfile(userId: string, profileId: string) {
  const profile = await prisma.healthProfile.findFirst({ where: { id: profileId, userId } });
  if (!profile) throw new HttpError(404, "Profile not found");
  return profile;
}

const metricSchema = z.object({
  metricType: z.string(),
  valueNum: z.number(),
  valueNum2: z.number().nullable().optional(),
  unit: z.string(),
  notes: z.string().nullable().optional(),
});

const labSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
  unit: z.string(),
  referenceRange: z.string().nullable().optional(),
});

const rxSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
});

const visitInput = z.object({
  visitDate: z.string().datetime().optional(),
  doctorName: z.string().nullable().optional(),
  clinicName: z.string().nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  metrics: z.array(metricSchema).default([]),
  labResults: z.array(labSchema).default([]),
  prescription: z.array(rxSchema).default([]),
  notes: z.string().nullable().optional(),
});

// GET /api/v1/profiles/:profileId/clinic-visits → list
clinicVisitsRouter.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const visits = await prisma.clinicVisit.findMany({
      where: { profileId },
      orderBy: { visitDate: "desc" },
    });
    res.json(visits);
  } catch (err) { next(err); }
});

// GET /api/v1/profiles/:profileId/clinic-visits/:id → detail
clinicVisitsRouter.get("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    const id = String(req.params.id);
    await assertOwnedProfile(req.userId!, profileId);
    const visit = await prisma.clinicVisit.findFirst({ where: { id, profileId } });
    if (!visit) throw new HttpError(404, "Visit not found");
    res.json(visit);
  } catch (err) { next(err); }
});

// POST /api/v1/profiles/:profileId/clinic-visits → create directly (manual entry)
clinicVisitsRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const data = visitInput.parse(req.body);
    const visit = await prisma.clinicVisit.create({
      data: {
        profileId,
        visitDate: data.visitDate ? new Date(data.visitDate) : new Date(),
        doctorName: data.doctorName ?? null,
        clinicName: data.clinicName ?? null,
        diagnosis: data.diagnosis ?? null,
        metrics: data.metrics,
        labResults: data.labResults,
        prescription: data.prescription,
        notes: data.notes ?? null,
      },
    });
    res.status(201).json(visit);
  } catch (err) { next(err); }
});

// POST /api/v1/profiles/:profileId/clinic-visits/from-exam → import from QR token
const fromExamInput = z.object({ token: z.string().min(1) });

clinicVisitsRouter.post("/from-exam", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const { token } = fromExamInput.parse(req.body);

    const exam = await prisma.examResult.findUnique({ where: { token } });
    if (!exam) throw new HttpError(404, "Không tìm thấy phiếu khám.");
    if (new Date() > exam.expiresAt) throw new HttpError(410, "Mã QR đã hết hạn.");

    const metrics = (exam.metrics as any[]) ?? [];
    const labResults = (exam.labResults as any[]) ?? [];
    const prescription = (exam.prescription as any[]) ?? [];
    const appointment = exam.appointment as any;

    const visitDate = exam.examDate ?? new Date();

    const [visit] = await prisma.$transaction(async (tx) => {
      const v = await tx.clinicVisit.create({
        data: {
          profileId,
          visitDate,
          doctorName: exam.doctorName,
          clinicName: exam.clinicName,
          diagnosis: exam.diagnosis,
          metrics,
          labResults,
          prescription,
        },
      });

      // Denormalize metrics to HealthMetric for chart usage.
      if (metrics.length > 0) {
        await tx.healthMetric.createMany({
          data: metrics.map((m: any) => ({
            profileId,
            metricType: m.metricType,
            valueNum: m.valueNum,
            valueNum2: m.valueNum2 ?? null,
            unit: m.unit,
            recordedAt: visitDate,
            notes: `Từ phiếu khám${exam.clinicName ? ` · ${exam.clinicName}` : ""}`,
          })),
        });
      }

      // Create appointment if provided
      if (appointment?.title && appointment?.scheduledAt) {
        await tx.appointment.create({
          data: {
            profileId,
            title: appointment.title,
            scheduledAt: new Date(appointment.scheduledAt),
            doctorName: appointment.doctorName ?? null,
            location: appointment.location ?? null,
            notes: null,
            status: "upcoming",
          },
        });
      }

      return [v];
    });

    res.status(201).json({
      visit,
      imported: {
        metrics: metrics.length,
        labResults: labResults.length,
        prescription: prescription.length,
        appointment: appointment?.title ? 1 : 0,
      },
    });
  } catch (err) { next(err); }
});

// DELETE /api/v1/profiles/:profileId/clinic-visits/:id
clinicVisitsRouter.delete("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    const id = String(req.params.id);
    await assertOwnedProfile(req.userId!, profileId);
    await prisma.clinicVisit.deleteMany({ where: { id, profileId } });
    res.status(204).end();
  } catch (err) { next(err); }
});
