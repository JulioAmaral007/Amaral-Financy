"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import * as fixedBillService from "@/services/fixed-bill.service";
import type { FixedBillView } from "@/services/fixed-bill.service";

import { FixedBillsView } from "./fixed-bills-view";

interface FixedBillsData {
  bills: FixedBillView[];
  alerts: FixedBillView[];
  total: number;
  page: number;
  totalPages: number;
}

export function FixedBillsSection() {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("fixedBillsPage")) || 1);
  const [data, setData] = useState<FixedBillsData | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fixedBillService.getAllFixedBills(), fixedBillService.getFixedBillsPage(page)]).then(
      ([allBills, pageResult]) => {
        if (cancelled) return;

        const decoratedAll = fixedBillService.decorateFixedBills(allBills);
        const alerts = decoratedAll.filter((bill) => bill.showAlert);
        const total = allBills.reduce((sum, bill) => sum + bill.amount, 0);

        setData({
          bills: pageResult.items,
          alerts,
          total,
          page: pageResult.page,
          totalPages: pageResult.totalPages,
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  if (!data) return null;

  return (
    <FixedBillsView
      bills={data.bills}
      alerts={data.alerts}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      onChanged={() => setReloadKey((key) => key + 1)}
    />
  );
}
