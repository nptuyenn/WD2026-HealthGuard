import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";

export const appointmentsRouter = Router({ mergeParams: true });

const appointmentInput = z.object({
  title: z.string().min(1).max(100),
  doctorName: z.string().max(100).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  scheduledAt: z.string().datetime(),
  notes: z.string().max(1000).optional().nullable(),
  status: z.enum(["upcoming", "completed", "cancelled"]).optional(),
});

async function assertOwnedProfile(userId: string, profileId: string) {
  const profile = await prisma.healthProfile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) throw new HttpError(404, "Profile not found");
}

appointmentsRouter.use(requireAuth);

appointmentsRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const items = await prisma.appointment.findMany({
      where: { profileId },
      orderBy: { scheduledAt: "asc" },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const data = appointmentInput.parse(req.body);
    const appt = await prisma.appointment.create({
      data: {
        profileId,
        title: data.title,
        doctorName: data.doctorName ?? null,
        location: data.location ?? null,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes ?? null,
        status: data.status ?? "upcoming",
      },
    });
    res.status(201).json(appt);
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.patch("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const id = String(req.params.id);
    const existing = await prisma.appointment.findFirst({ where: { id, profileId } });
    if (!existing) throw new HttpError(404, "Appointment not found");
    const data = appointmentInput.partial().parse(req.body);
    const appt = await prisma.appointment.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.doctorName !== undefined && { doctorName: data.doctorName }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.scheduledAt !== undefined && { scheduledAt: new Date(data.scheduledAt) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
    res.json(appt);
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const id = String(req.params.id);
    const existing = await prisma.appointment.findFirst({ where: { id, profileId } });
    if (!existing) throw new HttpError(404, "Appointment not found");
    await prisma.appointment.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
