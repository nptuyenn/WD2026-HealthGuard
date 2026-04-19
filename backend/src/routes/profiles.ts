import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";

export const profilesRouter = Router();

const profileInput = z.object({
  fullName: z.string().min(1).max(100),
  dob: z.string().datetime().optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  relationship: z.string().max(30).optional().nullable(),
  bloodType: z.string().max(10).optional().nullable(),
});

profilesRouter.use(requireAuth);

profilesRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const profiles = await prisma.healthProfile.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "asc" },
    });
    res.json(profiles);
  } catch (err) {
    next(err);
  }
});

profilesRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const data = profileInput.parse(req.body);
    const profile = await prisma.healthProfile.create({
      data: {
        ...data,
        dob: data.dob ? new Date(data.dob) : null,
        userId: req.userId!,
      },
    });
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

profilesRouter.patch("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const id = String(req.params.id);
    const data = profileInput.partial().parse(req.body);
    const existing = await prisma.healthProfile.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!existing) throw new HttpError(404, "Profile not found");

    const profile = await prisma.healthProfile.update({
      where: { id },
      data: {
        ...data,
        dob: data.dob ? new Date(data.dob) : data.dob,
      },
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

profilesRouter.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.healthProfile.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!existing) throw new HttpError(404, "Profile not found");

    await prisma.healthProfile.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
