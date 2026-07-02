import * as profileRepository from "@/repositories/profile.repository";
import type { Profile } from "@/types/profile";

export async function getProfile(): Promise<Profile> {
  return profileRepository.getProfile();
}

export async function updateDisplayName(fullName: string): Promise<Profile> {
  return profileRepository.updateProfileName(fullName);
}

export async function updateSalaries(salaries: {
  salary1: number;
  salary2: number;
  salary3: number;
}): Promise<Profile> {
  return profileRepository.updateProfileSalaries(salaries);
}

export function getInitials(fullName: string | null, email?: string | null): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase() || "?";
  }
  const firstChar = email?.charAt(0);
  return firstChar ? firstChar.toUpperCase() : "?";
}
