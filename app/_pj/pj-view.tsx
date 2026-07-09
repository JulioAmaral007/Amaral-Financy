"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ActiveCycleView, ArchivedCycleView } from "@/services/pj.service";

import { PjCycleConfigForm } from "./pj-cycle-config-form";
import { PjDashboard } from "./pj-dashboard";
import { PjHistory } from "./pj-history";
import { PjHistoryDetail } from "./pj-history-detail";

type Step = "dashboard" | "config" | "history" | "historyDetail";

interface PjViewProps {
  activeCycle: ActiveCycleView | null;
  archivedCycles: ArchivedCycleView[];
}

export function PjView({ activeCycle, archivedCycles }: PjViewProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("dashboard");
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  const selectedCycle = archivedCycles.find((item) => item.cycle.id === selectedCycleId) ?? null;

  if (!activeCycle) {
    return (
      <PjCycleConfigForm cycle={null} canCancel={false} onDone={() => router.refresh()} onCancel={() => {}} />
    );
  }

  if (step === "config") {
    return (
      <PjCycleConfigForm
        cycle={activeCycle.cycle}
        canCancel
        onDone={() => {
          router.refresh();
          setStep("dashboard");
        }}
        onCancel={() => setStep("dashboard")}
      />
    );
  }

  if (step === "history") {
    return (
      <PjHistory
        cycles={archivedCycles}
        onBack={() => setStep("dashboard")}
        onOpen={(id) => {
          setSelectedCycleId(id);
          setStep("historyDetail");
        }}
      />
    );
  }

  if (step === "historyDetail" && selectedCycle) {
    return <PjHistoryDetail cycle={selectedCycle} onBack={() => setStep("history")} />;
  }

  return (
    <PjDashboard
      activeCycle={activeCycle}
      onOpenConfig={() => setStep("config")}
      onOpenHistory={() => setStep("history")}
      onChanged={() => router.refresh()}
    />
  );
}
