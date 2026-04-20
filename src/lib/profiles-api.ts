import { api } from "./api";
import type { Profile } from "@/store/auth";

export type ProfileInput = {
  fullName: string;
  relationship?: string | null;
  dob?: string | null;
  gender?: string | null;
  bloodType?: string | null;
};

export async function createProfile(input: ProfileInput): Promise<Profile> {
  return api<Profile>("/api/v1/profiles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
