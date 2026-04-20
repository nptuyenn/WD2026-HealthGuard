import { api } from "./api";

export type MetricType =
  | "blood_pressure"
  | "glucose"
  | "heart_rate"
  | "weight"
  | "spo2"
  | "temperature"
  | "bmi";

export type AlertLevel =
  | "ok"
  | "high"
  | "low"
  | "fever"
  | "overweight"
  | "obese"
  | "underweight";

export type HealthMetric = {
  id: string;
  profileId: string;
  metricType: MetricType;
  valueNum: number;
  valueNum2: number | null;
  unit: string;
  recordedAt: string;
  notes: string | null;
};

export type MetricSeriesPoint = {
  recordedAt: string;
  valueNum: number;
  valueNum2: number | null;
};

export type MetricSummaryEntry = {
  latest: {
    valueNum: number;
    valueNum2: number | null;
    unit: string;
    recordedAt: string;
  } | null;
  alert: AlertLevel;
  series: MetricSeriesPoint[];
};

export type MetricSummary = Record<MetricType, MetricSummaryEntry>;

export type MetricInput = {
  metricType: MetricType;
  valueNum: number;
  valueNum2?: number | null;
  unit: string;
  recordedAt: string;
  notes?: string | null;
};

export type AIInsight = {
  summary: string;
  warnings: string[];
  recommendations: string[];
  disclaimer: string;
  updatedAt: string;
};

export const METRIC_META: Record<
  MetricType,
  { label: string; unit: string; thresholdText: string }
> = {
  blood_pressure: { label: "Huyết áp", unit: "mmHg", thresholdText: "90–120 / 60–80" },
  glucose: { label: "Đường huyết", unit: "mg/dL", thresholdText: "70–126" },
  heart_rate: { label: "Nhịp tim", unit: "bpm", thresholdText: "60–100" },
  weight: { label: "Cân nặng", unit: "kg", thresholdText: "—" },
  spo2: { label: "SpO₂", unit: "%", thresholdText: "≥ 95" },
  temperature: { label: "Nhiệt độ", unit: "°C", thresholdText: "36–37.5" },
  bmi: { label: "BMI", unit: "kg/m²", thresholdText: "18.5–25" },
};

export const ALERT_STATUS: Record<AlertLevel, { label: string; kind: "normal" | "warning" | "danger" }> = {
  ok: { label: "Bình thường", kind: "normal" },
  high: { label: "Cao", kind: "warning" },
  low: { label: "Thấp", kind: "warning" },
  fever: { label: "Sốt", kind: "danger" },
  overweight: { label: "Thừa cân", kind: "warning" },
  obese: { label: "Béo phì", kind: "danger" },
  underweight: { label: "Nhẹ cân", kind: "warning" },
};

export function formatMetricValue(
  type: MetricType,
  v1: number,
  v2: number | null
): string {
  if (type === "blood_pressure") return `${Math.round(v1)}/${Math.round(v2 ?? 0)}`;
  return String(Number.isInteger(v1) ? v1 : v1.toFixed(1));
}

export async function listMetrics(profileId: string, type?: MetricType) {
  const q = type ? `?type=${type}` : "";
  return api<HealthMetric[]>(`/api/v1/profiles/${profileId}/metrics${q}`);
}

export async function getMetricSummary(profileId: string) {
  return api<MetricSummary>(`/api/v1/profiles/${profileId}/metrics/summary`);
}

export async function createMetric(profileId: string, input: MetricInput) {
  return api<HealthMetric & { alert: AlertLevel }>(
    `/api/v1/profiles/${profileId}/metrics`,
    { method: "POST", body: JSON.stringify(input) }
  );
}

export async function analyzeMetrics(profileId: string) {
  return api<AIInsight>(`/api/v1/profiles/${profileId}/metrics/analyze`, {
    method: "POST",
  });
}
