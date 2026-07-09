"use client";

import { Card } from "@/components/ui/card";
import { ReceiptTitle } from "@/components/ui/receipt";
import { formatCurrencyBRL } from "@/lib/utils";

import type { CalculatorResultPayload } from "./calculator-form";

interface CalculatorResultPanelProps {
  payload: CalculatorResultPayload | null;
}

function buildStamp(): string {
  const now = new Date();
  const seq = String(now.getMonth() * 31 + now.getDate()).padStart(6, "0");
  return `Nº ${seq} · ${now.toLocaleDateString("pt-BR")}`;
}

export function CalculatorResultPanel({ payload }: CalculatorResultPanelProps) {
  if (!payload) return null;

  const { result, bill } = payload;
  const stamp = buildStamp();

  return (
    <Card className="-rotate-[0.4deg]">
      <div className="absolute right-3.5 top-3.5 inline-block rotate-[-7deg] rounded-[4px] border-2 border-red px-2 py-0.5 text-[12px] font-bold uppercase tracking-[0.12em] text-red opacity-90 [animation:stampIn_0.35s_ease]">
        Calculado
      </div>
      <div className="mb-4 text-center">
        <ReceiptTitle className="text-[22px] tracking-[0.1em]">CUPOM DE DIVISÃO</ReceiptTitle>
        <div className="mt-0.5 text-[11px] tracking-[0.12em] text-ink-faint" suppressHydrationWarning>
          {stamp}
        </div>
      </div>

      <div className="flex items-baseline border-b border-dashed border-rule-faint py-2.5 text-[15px]">
        <span className="font-bold text-ink">SALÁRIO 1</span>
        <span className="leader" />
        <span className="font-bold text-ink">{formatCurrencyBRL(result.salary1Payment)}</span>
      </div>
      <div className="flex items-baseline border-b border-dashed border-rule-faint py-2.5 text-[15px]">
        <span className="font-bold text-blue">SALÁRIO 2</span>
        <span className="leader" />
        <span className="font-bold text-blue">{formatCurrencyBRL(result.salary2Payment)}</span>
      </div>
      <div className="flex items-baseline py-2.5 text-[15px]">
        <span className="font-bold text-red">SALÁRIO 3</span>
        <span className="leader" />
        <span className="font-bold text-red">{formatCurrencyBRL(result.salary3Payment)}</span>
      </div>

      <div className="my-3 text-center text-[12px] tracking-[0.18em] text-ink-soft">* * * TOTAL * * *</div>
      <div className="border-y-[2.5px] border-ink py-2.5 text-center text-[26px] font-bold text-ink">
        {formatCurrencyBRL(bill)}
      </div>

      {result.exceeds && (
        <div className="mt-4 border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">
          !! A conta excede a soma dos salários em {formatCurrencyBRL(result.shortfall)}.
        </div>
      )}
    </Card>
  );
}
