import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { profiles: { orderBy: { createdAt: "asc" } } },
    });
    if (!user) throw new HttpError(404, "User not found");
    res.json({
      id: user.id,
      email: user.email,
      locale: user.locale,
      profiles: user.profiles,
    });
  } catch (err) {
    next(err);
  }
});
