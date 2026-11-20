"use client";

import { useEffect, useState } from "react";

import { shiftMonth } from "@/lib/month";
import * as fixedBillService from "@/services/fixed-bill.service";
import type { FixedBillView } from "@/services/fixed-bill.service";

import { FixedBillsView } from "./fixed-bills-view";
import { useDataReloadKey } from "./use-data-reload-key";
import { useSelectedMonth } from "./use-selected-month";

interface FixedBillsData {
  month: string;
  bills: FixedBillView[];
  previousMonthBillCount: number;
}

export function FixedBillsSection() {
  const [month] = useSelectedMonth();
  const reloadKey = useDataReloadKey();
  const [data, setData] = useState<FixedBillsData | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fixedBillService.getFixedBillsForMonth(month),
      fixedBillService.getFixedBillsForMonth(shiftMonth(month, -1)),
    ]).then(([bills, previousBills]) => {
      if (cancelled) return;
      setData({ month, bills, previousMonthBillCount: previousBills.length });
    });

    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);

  if (!data || data.month !== month) return null;

  return (
    <FixedBillsView month={month} bills={data.bills} previousMonthBillCount={data.previousMonthBillCount} />
  );
}
