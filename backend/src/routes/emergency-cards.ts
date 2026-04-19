import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";

export const emergencyCardsRouter = Router({ mergeParams: true });

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  relationship: z.string().optional().nullable(),
  isPrimary: z.boolean().optional(),
});

const cardInput = z.object({
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  contacts: z.array(contactSchema).max(10).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

async function assertOwnedProfile(userId: string, profileId: string) {
  const profile = await prisma.healthProfile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) throw new HttpError(404, "Profile not found");
  return profile;
}

emergencyCardsRouter.use(requireAuth);

emergencyCardsRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);

    const card = await prisma.emergencyCard.findUnique({
      where: { profileId },
    });
    if (!card) return res.status(404).json({ error: "Emergency card not found" });
    res.json(card);
  } catch (err) {
    next(err);
  }
});

emergencyCardsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);

    const data = cardInput.parse(req.body);
    const card = await prisma.emergencyCard.upsert({
      where: { profileId },
      create: {
        profileId,
        allergies: data.allergies ?? [],
        conditions: data.conditions ?? [],
        contacts: (data.contacts ?? []) as object,
        notes: data.notes ?? null,
      },
      update: {
        ...(data.allergies !== undefined && { allergies: data.allergies }),
        ...(data.conditions !== undefined && { conditions: data.conditions }),
        ...(data.contacts !== undefined && { contacts: data.contacts as object }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});

emergencyCardsRouter.patch("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);

    const data = cardInput.parse(req.body);
    const card = await prisma.emergencyCard.update({
      where: { profileId },
      data: {
        ...(data.allergies !== undefined && { allergies: data.allergies }),
        ...(data.conditions !== undefined && { conditions: data.conditions }),
        ...(data.contacts !== undefined && { contacts: data.contacts as object }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
});

emergencyCardsRouter.delete("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);

    await prisma.emergencyCard.delete({ where: { profileId } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

emergencyCardsRouter.post("/rotate-token", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);

    const card = await prisma.emergencyCard.update({
      where: { profileId },
      data: { publicToken: randomUUID(), tokenRevokedAt: null },
    });
    res.json({ publicToken: card.publicToken });
  } catch (err) {
    next(err);
  }
});
