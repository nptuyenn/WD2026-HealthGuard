import { api } from "./api";

export type Appointment = {
  id: string;
  profileId: string;
  title: string;
  doctorName: string | null;
  location: string | null;
  scheduledAt: string;
  notes: string | null;
  status: "upcoming" | "completed" | "cancelled";
};

export type AppointmentInput = {
  title: string;
  doctorName?: string | null;
  location?: string | null;
  scheduledAt: string;
  notes?: string | null;
  status?: "upcoming" | "completed" | "cancelled";
};

export async function listAppointments(profileId: string) {
  return api<Appointment[]>(`/api/v1/profiles/${profileId}/appointments`);
}

export async function createAppointment(profileId: string, input: AppointmentInput) {
  return api<Appointment>(`/api/v1/profiles/${profileId}/appointments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteAppointment(profileId: string, id: string) {
  return api<void>(`/api/v1/profiles/${profileId}/appointments/${id}`, { method: "DELETE" });
}
