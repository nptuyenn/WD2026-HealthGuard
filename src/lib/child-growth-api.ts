import { api } from "./api";
import type { Profile } from "@/store/auth";

export type ProfileInput = {
  fullName: string;
  dob?: string | null;
  gender?: string | null;
  relationship?: string | null;
  bloodType?: string | null;
};

export type Vaccination = {
  id: string;
  profileId: string;
  vaccineCode: string;
  vaccineName: string;
  doseNumber: number;
  ageGroup: string | null;
  scheduledDate: string;
  administeredAt: string | null;
  status: "pending" | "completed" | "overdue" | "skipped";
  notes: string | null;
};

export type GrowthRecord = {
  id: string;
  profileId: string;
  measuredOn: string;
  weightKg: number | null;
  heightCm: number | null;
  headCm: number | null;
  notes: string | null;
};

export async function createProfile(input: ProfileInput): Promise<Profile> {
  return api<Profile>("/api/v1/profiles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listVaccinations(profileId: string) {
  return api<Vaccination[]>(`/api/v1/profiles/${profileId}/vaccinations`);
}

export async function seedTcmr(profileId: string) {
  return api<{ created: number; vaccinations: Vaccination[] }>(
    `/api/v1/profiles/${profileId}/vaccinations/seed-tcmr`,
    { method: "POST" }
  );
}

export async function updateVaccination(
  profileId: string,
  id: string,
  patch: Partial<Pick<Vaccination, "status" | "administeredAt" | "notes">>
) {
  return api<Vaccination>(`/api/v1/profiles/${profileId}/vaccinations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function listGrowthRecords(profileId: string) {
  return api<GrowthRecord[]>(`/api/v1/profiles/${profileId}/growth-records`);
}

export async function createGrowthRecord(
  profileId: string,
  input: {
    measuredOn: string;
    weightKg?: number | null;
    heightCm?: number | null;
    headCm?: number | null;
    notes?: string | null;
  }
) {
  return api<GrowthRecord>(`/api/v1/profiles/${profileId}/growth-records`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
