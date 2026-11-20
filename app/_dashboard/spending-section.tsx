"use client";

import { useEffect, useState } from "react";

import { notifyLoadError } from "@/lib/load-error";
import * as monthService from "@/services/month.service";
import type { MonthSnapshot } from "@/services/month.service";

import { SpendingView } from "./spending-view";
import { useDataReloadKey } from "./use-data-reload-key";
import { useSelectedMonth } from "./use-selected-month";

export function SpendingSection() {
  const [month] = useSelectedMonth();
  const reloadKey = useDataReloadKey();
  const [data, setData] = useState<{ snapshot: MonthSnapshot; streak: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([monthService.getMonthSnapshot(month), monthService.getBudgetStreak(month)]).then(
      ([snapshot, streak]) => {
        if (!cancelled) setData({ snapshot, streak });
      },
      notifyLoadError
    );

    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);

  if (!data || data.snapshot.month !== month) return null;

  return <SpendingView key={month} snapshot={data.snapshot} streak={data.streak} />;
}
