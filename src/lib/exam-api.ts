import { api } from "./api";

export type ExamMetric = {
  metricType: string;
  valueNum: number;
  valueNum2?: number | null;
  unit: string;
  notes?: string | null;
};

export type ExamLabResult = {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string | null;
};

export type ExamPrescriptionItem = {
  name: string;
  dosage?: string | null;
  quantity?: number | null;
  instructions?: string | null;
};

export type ExamAppointment = {
  title: string;
  scheduledAt: string;
  doctorName?: string | null;
  location?: string | null;
  notes?: string | null;
};

export type ExamResult = {
  id: string;
  token: string;
  doctorName: string | null;
  clinicName: string | null;
  examDate: string;
  diagnosis: string | null;
  metrics: ExamMetric[];
  labResults: ExamLabResult[];
  prescription: ExamPrescriptionItem[];
  appointment: ExamAppointment | null;
  expiresAt: string;
};

export async function fetchExamResult(token: string): Promise<ExamResult> {
  const r = await api<ExamResult>(`/api/v1/exam/${token}`);
  return {
    ...r,
    metrics: r.metrics ?? [],
    labResults: r.labResults ?? [],
    prescription: r.prescription ?? [],
  };
}
