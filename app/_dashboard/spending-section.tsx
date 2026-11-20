"use client";

import { useEffect, useState } from "react";

import * as monthService from "@/services/month.service";
import type { MonthSnapshot } from "@/services/month.service";

import { SpendingView } from "./spending-view";
import { useDataReloadKey } from "./use-data-reload-key";
import { useSelectedMonth } from "./use-selected-month";

export function SpendingSection() {
  const [month] = useSelectedMonth();
  const reloadKey = useDataReloadKey();
  const [snapshot, setSnapshot] = useState<MonthSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;

    monthService.getMonthSnapshot(month).then((result) => {
      if (!cancelled) setSnapshot(result);
    });

    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);

  if (!snapshot || snapshot.month !== month) return null;

  return <SpendingView snapshot={snapshot} />;
}
