import { api } from "./api";

export type MedicationSchedule = {
  id: string;
  medicationId: string;
  timesOfDay: string[];
  daysOfWeek: number[];
  startsOn: string;
  endsOn: string | null;
};

export type Medication = {
  id: string;
  profileId: string;
  name: string;
  dosage: string | null;
  unit: string | null;
  instructions: string | null;
  stockTotal: number | null;
  stockRemaining: number | null;
  lowStockThreshold: number;
  expiryDate: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  schedules: MedicationSchedule[];
};

export type MedicationInput = {
  name: string;
  dosage?: string | null;
  unit?: string | null;
  instructions?: string | null;
  stockTotal?: number | null;
  stockRemaining?: number | null;
  expiryDate?: string | null;
  schedules?: {
    timesOfDay: string[];
    daysOfWeek?: number[];
    startsOn?: string;
    endsOn?: string | null;
  }[];
};

export type TimelineEvent = {
  eventKey: string;
  scheduleId: string;
  medicationId: string;
  medicationName: string;
  dosage: string | null;
  unit: string | null;
  instructions: string | null;
  scheduledDate: string;
  scheduledTime: string;
  scheduledAt: string;
  logId: string | null;
  status: "pending" | "taken" | "missed" | "skipped";
  takenAt: string | null;
};

export async function listMedications(profileId: string) {
  return api<Medication[]>(`/api/v1/profiles/${profileId}/medications`);
}

export async function getToday(profileId: string, date?: string) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return api<TimelineEvent[]>(`/api/v1/profiles/${profileId}/medications/today${qs}`);
}

export async function createMedication(profileId: string, input: MedicationInput) {
  return api<Medication>(`/api/v1/profiles/${profileId}/medications`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteMedication(profileId: string, id: string) {
  return api<void>(`/api/v1/profiles/${profileId}/medications/${id}`, { method: "DELETE" });
}

export async function updateMedication(profileId: string, id: string, input: Partial<MedicationInput>) {
  return api<Medication>(`/api/v1/profiles/${profileId}/medications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function addMedicationSchedule(
  profileId: string,
  medicationId: string,
  schedule: { timesOfDay: string[]; daysOfWeek?: number[]; startsOn?: string; endsOn?: string | null }
) {
  return api<MedicationSchedule>(
    `/api/v1/profiles/${profileId}/medications/${medicationId}/schedules`,
    { method: "POST", body: JSON.stringify(schedule) }
  );
}

export async function logDose(input: {
  scheduleId: string;
  scheduledAt: string;
  status: "taken" | "missed" | "skipped";
}) {
  return api(`/api/v1/medication-logs`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
