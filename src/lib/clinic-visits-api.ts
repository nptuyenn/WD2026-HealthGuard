import { api } from "./api";

export type VisitMetric = {
  metricType: string;
  valueNum: number;
  valueNum2?: number | null;
  unit: string;
  notes?: string | null;
};

export type LabResult = {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string | null;
};

export type PrescriptionItem = {
  name: string;
  dosage?: string | null;
  instructions?: string | null;
};

export type ClinicVisit = {
  id: string;
  profileId: string;
  visitDate: string;
  doctorName: string | null;
  clinicName: string | null;
  diagnosis: string | null;
  metrics: VisitMetric[];
  labResults: LabResult[];
  prescription: PrescriptionItem[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ImportFromExamResponse = {
  visit: ClinicVisit;
  imported: {
    metrics: number;
    labResults: number;
    prescription: number;
    appointment: number;
  };
};

function normalize(v: ClinicVisit): ClinicVisit {
  return {
    ...v,
    metrics: v.metrics ?? [],
    labResults: v.labResults ?? [],
    prescription: v.prescription ?? [],
  };
}

export async function listClinicVisits(profileId: string): Promise<ClinicVisit[]> {
  const r = await api<ClinicVisit[]>(`/api/v1/profiles/${profileId}/clinic-visits`);
  return r.map(normalize);
}

export async function getClinicVisit(profileId: string, id: string): Promise<ClinicVisit> {
  const r = await api<ClinicVisit>(`/api/v1/profiles/${profileId}/clinic-visits/${id}`);
  return normalize(r);
}

export async function importVisitFromExam(profileId: string, token: string): Promise<ImportFromExamResponse> {
  return api<ImportFromExamResponse>(
    `/api/v1/profiles/${profileId}/clinic-visits/from-exam`,
    { method: "POST", body: JSON.stringify({ token }) }
  );
}

export async function deleteClinicVisit(profileId: string, id: string): Promise<void> {
  await api(`/api/v1/profiles/${profileId}/clinic-visits/${id}`, { method: "DELETE" });
}
