import * as profileRepository from "@/repositories/profile.repository";
import type { Profile } from "@/types/profile";

export async function getProfile(): Promise<Profile> {
  return profileRepository.getProfile();
}

export async function updateSalaries(salaries: {
  salary1: number;
  salary2: number;
  salary3: number;
}): Promise<Profile> {
  return profileRepository.updateProfileSalaries(salaries);
}
