"use client";

import { useEffect, useState } from "react";

import * as profileService from "@/services/profile.service";

import { ProfileForm } from "./profile-form";

export default function ProfilePage() {
  const [data, setData] = useState<{ initialName: string; initials: string } | null>(null);

  useEffect(() => {
    profileService.getProfile().then((profile) => {
      setData({
        initialName: profile.fullName ?? "",
        initials: profileService.getInitials(profile.fullName),
      });
    });
  }, []);

  if (!data) return null;

  return <ProfileForm initialName={data.initialName} initials={data.initials} />;
}
