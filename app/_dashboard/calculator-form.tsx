"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { calculateAction } from "@/actions/calculate.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { emitHistoryUpdated } from "@/lib/history-events";
import { formatCurrencyBRL, parseCurrencyInput } from "@/lib/utils";
import { calculateFormSchema, type CalculateFormValues } from "@/schemas/calculate.schema";
import * as profileService from "@/services/profile.service";
import type { SalarySplitResult } from "@/types/bill-split";

import { CalculatorEmptyState } from "./calculator-empty-state";
import { CalculatorResultPanel } from "./calculator-result-panel";

export function CalculatorForm() {
  const [result, setResult] = useState<SalarySplitResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control, reset } = useForm<CalculateFormValues>({
    resolver: zodResolver(calculateFormSchema),
    defaultValues: { salary1: "", salary2: "", salary3: "", billAmount: "" },
  });

  useEffect(() => {
    profileService.getProfile().then((profile) => {
      reset({
        salary1: profile.salary1 ? String(profile.salary1) : "",
        salary2: profile.salary2 ? String(profile.salary2) : "",
        salary3: profile.salary3 ? String(profile.salary3) : "",
        billAmount: "",
      });
    });
  }, [reset]);

  const values = useWatch({ control });
  const sumSalaries =
    parseCurrencyInput(values.salary1 ?? "") +
    parseCurrencyInput(values.salary2 ?? "") +
    parseCurrencyInput(values.salary3 ?? "");
  const bill = parseCurrencyInput(values.billAmount ?? "");

  function handleClear() {
    reset({ salary1: "", salary2: "", salary3: "", billAmount: "" });
    setResult(undefined);
    setError(undefined);
  }

  function onSubmit(data: CalculateFormValues) {
    setError(undefined);
    startTransition(async () => {
      const response = await calculateAction({
        salary1: parseCurrencyInput(data.salary1),
        salary2: parseCurrencyInput(data.salary2),
        salary3: parseCurrencyInput(data.salary3),
        billAmount: parseCurrencyInput(data.billAmount),
      });
      if (response.error) setError(response.error);
      if (response.result) setResult(response.result);
      if (response.result && !response.error) emitHistoryUpdated();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <p className="mb-5 text-[12px] font-semibold uppercase tracking-wider text-foreground/55">
          Dados para Cálculo
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="salary1" className="mb-2 flex items-center gap-2">
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-primary/18 text-[11px] font-bold text-primary-soft">
                1
              </span>
              <span className="text-sm font-semibold text-foreground">Salário 1</span>
              <span className="rounded-full bg-primary/14 px-2 py-0.5 text-[11px] font-semibold text-primary-soft">
                Prioritário
              </span>
            </label>
            <Input id="salary1" prefix="R$" inputMode="decimal" placeholder="0,00" {...register("salary1")} />
          </div>

          <div>
            <label htmlFor="salary2" className="mb-2 flex items-center gap-2">
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-blue/18 text-[11px] font-bold text-blue-soft">
                2
              </span>
              <span className="text-sm font-semibold text-foreground">Salário 2</span>
              <span className="text-xs text-foreground/45">(Proporcional do excedente)</span>
            </label>
            <Input id="salary2" prefix="R$" inputMode="decimal" placeholder="0,00" {...register("salary2")} />
          </div>

          <div>
            <label htmlFor="salary3" className="mb-2 flex items-center gap-2">
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-purple/18 text-[11px] font-bold text-purple-soft">
                3
              </span>
              <span className="text-sm font-semibold text-foreground">Salário 3</span>
              <span className="text-xs text-foreground/45">(Proporcional do excedente)</span>
            </label>
            <Input id="salary3" prefix="R$" inputMode="decimal" placeholder="0,00" {...register("salary3")} />
          </div>

          <div className="h-px bg-border/6" />

          <div>
            <label htmlFor="billAmount" className="mb-2 flex items-center gap-2">
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-amber/18 text-[12px] font-bold text-amber-soft">
                $
              </span>
              <span className="text-sm font-semibold text-foreground">Valor da Conta</span>
            </label>
            <Input
              id="billAmount"
              prefix="R$"
              inputMode="decimal"
              placeholder="0,00"
              {...register("billAmount")}
            />
          </div>

          <div className="space-y-2 rounded-[10px] bg-input p-4">
            <div className="flex justify-between text-[13.5px]">
              <span className="text-foreground/55">Soma dos Salários:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrencyBRL(sumSalaries)}
              </span>
            </div>
            <div className="flex justify-between text-[13.5px]">
              <span className="text-foreground/55">Valor da Conta:</span>
              <span className="font-mono font-semibold text-foreground">{formatCurrencyBRL(bill)}</span>
            </div>
          </div>

          {error && <p className="text-[13px] text-danger-soft">{error}</p>}

          <div className="grid grid-cols-[1fr_1.4fr] gap-3">
            <Button type="button" variant="outline" onClick={handleClear}>
              Limpar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calcular"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-col">
        {result ? <CalculatorResultPanel result={result} /> : <CalculatorEmptyState />}
      </Card>
    </div>
  );
}
