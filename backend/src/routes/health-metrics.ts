import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { getGemini, HEALTH_ANALYSIS_SCHEMA, SYSTEM_INSTRUCTION } from "../lib/gemini";

export const healthMetricsRouter = Router({ mergeParams: true });

const METRIC_TYPES = [
  "blood_pressure",
  "glucose",
  "heart_rate",
  "weight",
  "spo2",
  "temperature",
  "bmi",
] as const;

const metricInput = z.object({
  metricType: z.enum(METRIC_TYPES),
  valueNum: z.number(),
  valueNum2: z.number().optional().nullable(),
  unit: z.string().min(1).max(20),
  recordedAt: z.string().datetime(),
  notes: z.string().max(500).optional().nullable(),
});

async function assertOwnedProfile(userId: string, profileId: string) {
  const profile = await prisma.healthProfile.findFirst({
    where: { id: profileId, userId },
  });
  if (!profile) throw new HttpError(404, "Profile not found");
  return profile;
}

type AlertLevel = "ok" | "high" | "low" | "fever" | "overweight" | "obese" | "underweight";

function alertFor(type: string, v1: number, v2: number | null): AlertLevel {
  switch (type) {
    case "blood_pressure":
      if (v2 == null) return "ok";
      if (v1 >= 140 || v2 >= 90) return "high";
      if (v1 < 90 || v2 < 60) return "low";
      return "ok";
    case "glucose":
      if (v1 > 126) return "high";
      if (v1 < 70) return "low";
      return "ok";
    case "heart_rate":
      if (v1 > 100) return "high";
      if (v1 < 60) return "low";
      return "ok";
    case "spo2":
      if (v1 < 95) return "low";
      return "ok";
    case "temperature":
      if (v1 >= 38) return "fever";
      if (v1 < 36) return "low";
      return "ok";
    case "bmi":
      if (v1 >= 30) return "obese";
      if (v1 >= 25) return "overweight";
      if (v1 < 18.5) return "underweight";
      return "ok";
    default:
      return "ok";
  }
}

healthMetricsRouter.use(requireAuth);

healthMetricsRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const type = req.query.type ? String(req.query.type) : undefined;
    const limit = Math.min(500, Number(req.query.limit) || 200);

    const rows = await prisma.healthMetric.findMany({
      where: { profileId, ...(type && { metricType: type }) },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

healthMetricsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const data = metricInput.parse(req.body);
    const row = await prisma.healthMetric.create({
      data: {
        profileId,
        metricType: data.metricType,
        valueNum: data.valueNum,
        valueNum2: data.valueNum2 ?? null,
        unit: data.unit,
        recordedAt: new Date(data.recordedAt),
        notes: data.notes ?? null,
      },
    });
    res.status(201).json({
      ...row,
      alert: alertFor(row.metricType, row.valueNum, row.valueNum2),
    });
  } catch (err) {
    next(err);
  }
});

healthMetricsRouter.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);
    const id = String(req.params.id);
    const existing = await prisma.healthMetric.findFirst({ where: { id, profileId } });
    if (!existing) throw new HttpError(404, "Metric not found");
    await prisma.healthMetric.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

healthMetricsRouter.get("/summary", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    await assertOwnedProfile(req.userId!, profileId);

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const rows = await prisma.healthMetric.findMany({
      where: { profileId, recordedAt: { gte: since } },
      orderBy: { recordedAt: "asc" },
    });

    const byType: Record<string, typeof rows> = {};
    for (const r of rows) {
      if (!byType[r.metricType]) byType[r.metricType] = [];
      byType[r.metricType].push(r);
    }

    const result: Record<string, {
      latest: { valueNum: number; valueNum2: number | null; unit: string; recordedAt: string } | null;
      alert: AlertLevel;
      series: { recordedAt: string; valueNum: number; valueNum2: number | null }[];
    }> = {};

    for (const type of METRIC_TYPES) {
      const series = byType[type] ?? [];
      const latest = series.length > 0 ? series[series.length - 1] : null;
      result[type] = {
        latest: latest
          ? {
              valueNum: latest.valueNum,
              valueNum2: latest.valueNum2,
              unit: latest.unit,
              recordedAt: latest.recordedAt.toISOString(),
            }
          : null,
        alert: latest ? alertFor(type, latest.valueNum, latest.valueNum2) : "ok",
        series: series.map((r) => ({
          recordedAt: r.recordedAt.toISOString(),
          valueNum: r.valueNum,
          valueNum2: r.valueNum2,
        })),
      };
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

healthMetricsRouter.post("/analyze", async (req: AuthedRequest, res, next) => {
  try {
    const profileId = String(req.params.profileId);
    const profile = await assertOwnedProfile(req.userId!, profileId);

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const rows = await prisma.healthMetric.findMany({
      where: { profileId, recordedAt: { gte: since } },
      orderBy: { recordedAt: "asc" },
    });

    if (rows.length === 0) {
      return res.status(400).json({ error: "Chưa có dữ liệu sức khỏe để phân tích." });
    }

    const metricsPayload = rows.map((r) => ({
      type: r.metricType,
      value: r.valueNum,
      value2: r.valueNum2,
      unit: r.unit,
      at: r.recordedAt.toISOString().slice(0, 10),
    }));

    const age = profile.dob
      ? Math.floor((Date.now() - profile.dob.getTime()) / (365.25 * 86400000))
      : null;
    const userCtx = `Người dùng: ${profile.fullName}${age != null ? `, tuổi ~${age}` : ""}${
      profile.gender ? `, giới tính ${profile.gender}` : ""
    }.`;

    const prompt = `${userCtx}

Dữ liệu sức khỏe 30 ngày gần nhất (JSON):
${JSON.stringify(metricsPayload, null, 2)}

Hãy phân tích xu hướng và đưa ra nhận xét theo schema JSON đã cho.`;

    const ai = getGemini();
    let resp;
    try {
      resp = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: HEALTH_ANALYSIS_SCHEMA,
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
    } catch (e: any) {
      throw new HttpError(502, `Gemini API lỗi: ${e?.message ?? "unknown"}`);
    }

    const text = resp.text;
    if (!text) throw new HttpError(502, "Gemini trả về rỗng");

    let parsed: { summary: string; warnings: string[]; recommendations: string[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new HttpError(502, "Không parse được JSON từ Gemini");
    }

    res.json({
      ...parsed,
      disclaimer:
        "Thông tin chỉ mang tính tham khảo. Vui lòng tham khảo bác sĩ cho quyết định y tế.",
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
