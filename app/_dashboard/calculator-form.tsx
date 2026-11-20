"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { calculateAction } from "@/actions/calculate.actions";
import { saveMonthInputsAction } from "@/actions/month.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { LeaderRow, ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { emitHistoryUpdated } from "@/lib/history-events";
import { PERSON_LABELS } from "@/lib/people";
import { cn, formatCurrencyBRL, parseCurrencyInput, round2 } from "@/lib/utils";
import { calculateFormSchema, type CalculateFormValues } from "@/schemas/calculate.schema";
import * as billSplitService from "@/services/bill-split.service";
import type { MonthSnapshot } from "@/services/month.service";
import type { SalarySplitResult } from "@/types/bill-split";
import type { SplitMode } from "@/types/month";

export interface CalculatorResultPayload {
  result: SalarySplitResult;
  bill: number;
}

interface CalculatorFormProps {
  snapshot: MonthSnapshot;
  onResult: (payload: CalculatorResultPayload | null) => void;
}

const amountClass = "text-[18px] font-bold";
const SAVE_DELAY_MS = 500;

const SPLIT_MODE_OPTIONS: Array<{ value: SplitMode; label: string }> = [
  { value: "equal", label: "50 / 50" },
  { value: "proportional", label: "Proporcional" },
];

function toCents(value: number): string {
  return value ? String(Math.round(value * 100)) : "";
}

export function CalculatorForm({ snapshot, onResult }: CalculatorFormProps) {
  const { month, settings, profile, totals } = snapshot;
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { handleSubmit, control } = useForm<CalculateFormValues>({
    resolver: zodResolver(calculateFormSchema),
    defaultValues: {
      inss: toCents(settings.inss),
      extraPai: toCents(settings.extraPai),
      salary2: toCents(profile.salary2),
      salary3: toCents(profile.salary3),
      splitMode: settings.splitMode,
    },
  });

  const values = useWatch({ control });
  const inss = parseCurrencyInput(values.inss ?? "");
  const extraPai = parseCurrencyInput(values.extraPai ?? "");
  const salary2 = parseCurrencyInput(values.salary2 ?? "");
  const salary3 = parseCurrencyInput(values.salary3 ?? "");
  const splitMode: SplitMode = values.splitMode ?? settings.splitMode;
  const salary1 = round2(inss + extraPai);
  const bill = totals.total;
  const remainder = round2(Math.max(0, bill - salary1));

  const result = useMemo(
    () =>
      bill > 0
        ? billSplitService.calculateMonthSplit(splitMode, { salary1, salary2, salary3 }, bill)
        : null,
    [bill, splitMode, salary1, salary2, salary3]
  );

  useEffect(() => {
    onResult(result ? { result, bill } : null);
  }, [result, bill, onResult]);

  // Grava as entradas do mês sozinho (sem botão), como numa planilha. Só grava
  // quando algo mudou de verdade, para não "congelar" um mês apenas por abri-lo.
  const lastSaved = useRef(JSON.stringify([inss, extraPai, salary2, salary3, splitMode]));
  useEffect(() => {
    const snapshotKey = JSON.stringify([inss, extraPai, salary2, salary3, splitMode]);
    if (snapshotKey === lastSaved.current) return;

    const handle = setTimeout(() => {
      lastSaved.current = snapshotKey;
      saveMonthInputsAction({ month, inss, extraPai, salary2, salary3, splitMode }).then((response) => {
        if (response.error) toast.error(response.error);
      });
    }, SAVE_DELAY_MS);

    return () => clearTimeout(handle);
  }, [month, inss, extraPai, salary2, salary3, splitMode]);

  function onSubmit() {
    setError(undefined);
    startTransition(async () => {
      const response = await calculateAction({
        month,
        inss,
        extraPai,
        salary2,
        salary3,
        splitMode,
        billAmount: bill,
      });
      if (response.error) {
        setError(response.error);
        return;
      }
      toast.success("Divisão registrada no histórico.");
      emitHistoryUpdated();
    });
  }

  return (
    <Card className="rotate-[0.3deg]">
      <div className="mb-1.5 text-center">
        <ReceiptTitle className="tracking-[0.1em]">DIVISÃO DO MÊS</ReceiptTitle>
        <p className="mt-0.5 text-[11.5px] uppercase tracking-[0.12em] text-ink-faint">
          INSS + extra pagam primeiro; o saldo vai para {PERSON_LABELS.salary2} e {PERSON_LABELS.salary3}
        </p>
        <StarDivider className="mt-2 text-center" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-[13px] font-bold tracking-[0.1em] text-ink">INSS</span>
              <span className="inline-block -rotate-3 rounded-[4px] border-2 border-red px-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red opacity-85">
                prioritário
              </span>
            </div>
            <Controller
              control={control}
              name="inss"
              render={({ field }) => (
                <CurrencyInput id="inss" className={amountClass} value={field.value} onValueChange={field.onChange} />
              )}
            />
          </div>

          <div>
            <div className="mb-1 text-[13px] font-bold tracking-[0.1em] text-ink">EXTRA PAI</div>
            <Controller
              control={control}
              name="extraPai"
              render={({ field }) => (
                <CurrencyInput
                  id="extraPai"
                  className={amountClass}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className="mb-[18px]">
          <div className="mb-1.5 text-[13px] font-bold tracking-[0.1em] text-ink">COMO DIVIDIR O SALDO</div>
          <Controller
            control={control}
            name="splitMode"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Como dividir o saldo">
                {SPLIT_MODE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={field.value === option.value}
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "cursor-pointer border-2 px-3 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.14em] transition-colors",
                      field.value === option.value
                        ? "border-ink bg-ink text-paper"
                        : "border-rule bg-transparent text-ink hover:border-ink"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />
          <p className="mt-1.5 text-[11.5px] text-ink-faint">
            {splitMode === "equal"
              ? "Metade para cada um, como na planilha."
              : "Cada um paga conforme o salário (piso de R$ 500 para os dois)."}
          </p>
        </div>

        {splitMode === "proportional" && (
          <div className="mb-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[13px] font-bold tracking-[0.1em] text-blue">
                SALÁRIO {PERSON_LABELS.salary2.toUpperCase()}
              </div>
              <Controller
                control={control}
                name="salary2"
                render={({ field }) => (
                  <CurrencyInput
                    id="salary2"
                    className={amountClass}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>
            <div>
              <div className="mb-1 text-[13px] font-bold tracking-[0.1em] text-red">
                SALÁRIO {PERSON_LABELS.salary3.toUpperCase()}
              </div>
              <Controller
                control={control}
                name="salary3"
                render={({ field }) => (
                  <CurrencyInput
                    id="salary3"
                    className={amountClass}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        )}

        <div className="mb-[22px] border-[3px] border-double border-ink px-3 py-3 sm:px-4">
          <LeaderRow label="Contas do mês" value={formatCurrencyBRL(totals.bills)} />
          <LeaderRow label="Cartão de crédito (gastos)" value={formatCurrencyBRL(totals.spending)} />
          <LeaderRow label="Total do mês" value={formatCurrencyBRL(totals.total)} />
          <LeaderRow label="INSS + extra pai" value={`− ${formatCurrencyBRL(Math.min(salary1, bill))}`} />
          <LeaderRow label="Saldo a dividir" value={formatCurrencyBRL(remainder)} valueClassName="text-[15px]" />
        </div>

        {error && (
          <p className="mb-4 border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">!! {error}</p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar divisão no histórico"}
        </Button>
      </form>
    </Card>
  );
}
