import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import type { Profile } from "@/types/profile";

const DEFAULT_PROFILE: Profile = {
  fullName: null,
  avatarUrl: null,
  salary1: 0,
  salary2: 0,
  salary3: 0,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export async function getProfile(): Promise<Profile> {
  return readStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export async function updateProfileName(fullName: string): Promise<Profile> {
  const profile: Profile = {
    ...(await getProfile()),
    fullName,
    updatedAt: new Date().toISOString(),
  };

  writeStorage(STORAGE_KEYS.PROFILE, profile);
  return profile;
}

export async function updateProfileSalaries(salaries: {
  salary1: number;
  salary2: number;
  salary3: number;
}): Promise<Profile> {
  const profile: Profile = {
    ...(await getProfile()),
    ...salaries,
    updatedAt: new Date().toISOString(),
  };

  writeStorage(STORAGE_KEYS.PROFILE, profile);
  return profile;
}
