"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Card, CardHeader } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { MONTH_NAMES, parseMonthKey } from "@/lib/month";
import * as historyService from "@/services/history.service";
import * as workspaceService from "@/services/workspace.service";
import type { HistoryEntry } from "@/types/history";

import { HistoryList } from "./history-list";
import { useDataReloadKey } from "./use-data-reload-key";
import { useSelectedMonth } from "./use-selected-month";

interface HistoryData {
  month: string;
  splitEnabled: boolean;
  items: HistoryEntry[];
  page: number;
  totalPages: number;
}

/** Divisões registradas no mês escolhido. O gráfico do ano vive na régua de meses. */
export function HistorySection() {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("historyPage")) || 1);
  const [month] = useSelectedMonth();
  const reloadKey = useDataReloadKey();
  const [data, setData] = useState<HistoryData | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([historyService.getHistoryPage(month, page), workspaceService.getActiveWorkspace()]).then(
      ([historyPage, workspace]) => {
        if (cancelled) return;
        setData({
          month,
          splitEnabled: workspace.splitEnabled,
          items: historyPage.items,
          page: historyPage.page,
          totalPages: historyPage.totalPages,
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [month, page, reloadKey]);

  // Perfis sem divisão não registram divisões.
  if (!data || data.month !== month || !data.splitEnabled) return null;

  const monthName = MONTH_NAMES[parseMonthKey(month).monthIndex].toLowerCase();

  return (
    <Card id="divisoes">
      <CardHeader
        title="Divisões registradas"
        subtitle={`O que ficou combinado em ${monthName}.`}
      />
      <HistoryList entries={data.items} />
      <Pagination page={data.page} totalPages={data.totalPages} paramName="historyPage" />
    </Card>
  );
}
