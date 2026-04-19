import { api } from "./api";

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship?: string | null;
  isPrimary?: boolean;
};

export type EmergencyCard = {
  id: string;
  profileId: string;
  allergies: string[];
  conditions: string[];
  contacts: EmergencyContact[];
  notes: string | null;
  publicToken: string;
  tokenRevokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmergencyCardInput = {
  allergies?: string[];
  conditions?: string[];
  contacts?: EmergencyContact[];
  notes?: string | null;
};

export async function getEmergencyCard(profileId: string): Promise<EmergencyCard | null> {
  try {
    return await api<EmergencyCard>(`/api/v1/profiles/${profileId}/emergency-card`);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function upsertEmergencyCard(
  profileId: string,
  input: EmergencyCardInput
): Promise<EmergencyCard> {
  return api<EmergencyCard>(`/api/v1/profiles/${profileId}/emergency-card`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function rotateEmergencyToken(profileId: string): Promise<{ publicToken: string }> {
  return api<{ publicToken: string }>(
    `/api/v1/profiles/${profileId}/emergency-card/rotate-token`,
    { method: "POST" }
  );
}
