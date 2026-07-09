"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateInvestmentSettingsAction } from "@/actions/investment.actions";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { HatchBar, ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { Input } from "@/components/ui/input";
import { parseCurrencyInput } from "@/lib/utils";
import type { ReserveView } from "@/services/investment-view.service";
import type { InvestmentSettings } from "@/types/investment";

interface ReserveCardProps {
  reserve: ReserveView;
  settings: InvestmentSettings;
}

function toCentsString(value: number): string {
  return value ? String(Math.round(value * 100)) : "";
}

export function ReserveCard({ reserve, settings }: ReserveCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [monthlyCost, setMonthlyCost] = useState(toCentsString(settings.reserveMonthlyCost));
  const [targetMonths, setTargetMonths] = useState(String(settings.reserveTargetMonths));

  function save() {
    const parsedMonths = Number.parseInt(targetMonths, 10);
    if (!Number.isFinite(parsedMonths)) {
      setTargetMonths(String(settings.reserveTargetMonths));
      return;
    }

    startTransition(async () => {
      const result = await updateInvestmentSettingsAction({
        investorProfile: settings.investorProfile,
        reserveMonthlyCost: parseCurrencyInput(monthlyCost),
        reserveTargetMonths: parsedMonths,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="-rotate-[0.25deg]">
      <ReceiptTitle className="text-[18px] tracking-[0.08em] sm:text-[20px]">RESERVA DE EMERGÊNCIA</ReceiptTitle>
      <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
        somatório dos seus ativos de renda fixa
      </p>

      <StarDivider className="mb-4 mt-2" />

      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[19px] font-bold text-ink sm:text-[22px]">{reserve.currentFormatted}</span>
        <span className="text-[13px] text-ink-faint">de {reserve.targetFormatted}</span>
      </div>

      <HatchBar pct={reserve.pct} className="mb-2" />

      <div className="mb-[18px] flex items-baseline justify-between gap-2 text-[12.5px] text-ink-soft">
        <span className="font-bold text-green">{reserve.pctLabel}</span>
        <span>{reserve.coverageLabel}</span>
      </div>

      <div className="flex gap-5 border-t-2 border-dashed border-rule-faint pt-3">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="reserve-monthly-cost"
            className="mb-0.5 block text-[10.5px] uppercase tracking-[0.16em] text-ink-faint"
          >
            Custo mensal
          </label>
          <CurrencyInput
            id="reserve-monthly-cost"
            value={monthlyCost}
            onValueChange={setMonthlyCost}
            onBlur={save}
            disabled={isPending}
          />
        </div>
        <div className="min-w-0 flex-1">
          <label
            htmlFor="reserve-target-months"
            className="mb-0.5 block text-[10.5px] uppercase tracking-[0.16em] text-ink-faint"
          >
            Meses-alvo
          </label>
          <Input
            id="reserve-target-months"
            inputMode="numeric"
            value={targetMonths}
            onChange={(event) => setTargetMonths(event.target.value.replace(/\D/g, ""))}
            onBlur={save}
            disabled={isPending}
          />
        </div>
      </div>
    </Card>
  );
}
