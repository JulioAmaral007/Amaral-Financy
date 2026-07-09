"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateCdiRateAction } from "@/actions/account.actions";
import { parseDecimalInput } from "@/lib/utils";

interface PreferencesCardProps {
  initialCdiRate: number;
}

function formatRate(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PreferencesCard({ initialCdiRate }: PreferencesCardProps) {
  const [cdiRate, setCdiRate] = useState(formatRate(initialCdiRate));
  const [isSaving, startSaving] = useTransition();

  function handleBlur() {
    const parsed = parseDecimalInput(cdiRate);
    startSaving(async () => {
      const result = await updateCdiRateAction({ cdiBaseRate: parsed });
      if (result?.error) {
        toast.error(result.error);
        setCdiRate(formatRate(initialCdiRate));
        return;
      }
      setCdiRate(formatRate(parsed));
    });
  }

  return (
    <section>
      <div className="mb-2.5 border-b-2 border-ink pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-soft">
        Preferências
      </div>

      <div className="flex items-center justify-between gap-4 py-1.5">
        <div>
          <div className="text-[14px] font-bold text-ink">Taxa CDI de referência</div>
          <div className="text-[12px] text-ink-faint">usada nos rendimentos de metas atreladas ao CDI</div>
        </div>
        <div className="flex flex-none items-baseline gap-1">
          <input
            value={cdiRate}
            onChange={(event) => setCdiRate(event.target.value)}
            onBlur={handleBlur}
            disabled={isSaving}
            inputMode="decimal"
            className="w-[76px] border-b-2 border-dotted border-rule bg-transparent px-0.5 py-1 text-right text-[14px] font-bold text-ink outline-none focus:border-ink"
          />
          <span className="text-[13px] text-ink-faint">%</span>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-dashed border-rule-faint py-2">
        <span className="text-[14px] font-bold text-ink">Moeda</span>
        <span className="text-[13px] text-ink-faint">Real (R$)</span>
      </div>
    </section>
  );
}
