import { Router } from "express";
import { prisma } from "../lib/prisma";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok", timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      db: "unreachable",
      timestamp: new Date().toISOString(),
    });
  }
});
