import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  fullName: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function issueToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new HttpError(500, "JWT_SECRET not configured");
  return jwt.sign({ sub: userId }, secret, { expiresIn: "30d" });
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, fullName } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profiles: {
          create: { fullName, relationship: "self" },
        },
      },
      include: { profiles: true },
    });

    const token = issueToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, locale: user.locale },
      profiles: user.profiles,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid email or password");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid email or password");

    const token = issueToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, locale: user.locale },
    });
  } catch (err) {
    next(err);
  }
});
