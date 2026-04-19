import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";

export const growthRecordsRouter = Router({ mergeParams: true });

const recordInput = z.object({
  measuredOn: z.string().datetime(),
  weightKg: z.number().positive().max(200).optional().nullable(),
  heightCm: z.number().positive().max(250).optional().nullable(),
  headCm: z.number().positive().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

async function assertOwnedProfile(userId: string, profileId: string) {
  const profile = await prisma.healthProfile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) throw new HttpError(404, "Profile not found");
  return profile;
}

growthRecordsRouter.use(requireAuth);

growthRecordsRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const rows = await prisma.growthRecord.findMany({
      where: { profileId },
      orderBy: { measuredOn: "asc" },
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

growthRecordsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const data = recordInput.parse(req.body);
    const row = await prisma.growthRecord.create({
      data: {
        profileId,
        measuredOn: new Date(data.measuredOn),
        weightKg: data.weightKg ?? null,
        heightCm: data.heightCm ?? null,
        headCm: data.headCm ?? null,
        notes: data.notes ?? null,
      },
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

growthRecordsRouter.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const id = String(req.params.id);
    const existing = await prisma.growthRecord.findFirst({ where: { id, profileId } });
    if (!existing) throw new HttpError(404, "Record not found");
    await prisma.growthRecord.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
