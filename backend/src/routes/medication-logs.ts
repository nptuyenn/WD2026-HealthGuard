import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";

export const medicationLogsRouter = Router();

const logInput = z.object({
  scheduleId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  status: z.enum(["taken", "missed", "skipped"]),
  takenAt: z.string().datetime().optional().nullable(),
});

medicationLogsRouter.use(requireAuth);

medicationLogsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const data = logInput.parse(req.body);

    const schedule = await prisma.medicationSchedule.findFirst({
      where: {
        id: data.scheduleId,
        medication: { profile: { userId: req.userId! } },
      },
      include: { medication: true },
    });
    if (!schedule) throw new HttpError(404, "Schedule not found");

    const scheduledAt = new Date(data.scheduledAt);
    const existing = await prisma.medicationLog.findFirst({
      where: { scheduleId: data.scheduleId, scheduledAt },
    });

    const takenAt =
      data.status === "taken"
        ? data.takenAt
          ? new Date(data.takenAt)
          : new Date()
        : null;

    let log;
    if (existing) {
      log = await prisma.medicationLog.update({
        where: { id: existing.id },
        data: { status: data.status, takenAt },
      });
    } else {
      log = await prisma.medicationLog.create({
        data: {
          scheduleId: data.scheduleId,
          scheduledAt,
          status: data.status,
          takenAt,
        },
      });
    }

    if (data.status === "taken" && schedule.medication.stockRemaining != null) {
      await prisma.medication.update({
        where: { id: schedule.medicationId },
        data: { stockRemaining: Math.max(0, schedule.medication.stockRemaining - 1) },
      });
    }

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});
