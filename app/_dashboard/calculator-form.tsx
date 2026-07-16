"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { calculateAction } from "@/actions/calculate.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { onFixedBillsUpdated } from "@/lib/fixed-bill-events";
import { emitHistoryUpdated } from "@/lib/history-events";
import { formatCurrencyBRL, parseCurrencyInput } from "@/lib/utils";
import { calculateFormSchema, type CalculateFormValues } from "@/schemas/calculate.schema";
import * as fixedBillService from "@/services/fixed-bill.service";
import * as profileService from "@/services/profile.service";
import type { SalarySplitResult } from "@/types/bill-split";

export interface CalculatorResultPayload {
  result: SalarySplitResult;
  bill: number;
}

interface CalculatorFormProps {
  onResult: (payload: CalculatorResultPayload | null) => void;
}

const amountClass = "text-[18px] font-bold";

export function CalculatorForm({ onResult }: CalculatorFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { handleSubmit, control, reset, setValue } = useForm<CalculateFormValues>({
    resolver: zodResolver(calculateFormSchema),
    defaultValues: { salary1: "", salary2: "", salary3: "", billAmount: "" },
  });

  useEffect(() => {
    Promise.all([profileService.getProfile(), fixedBillService.getAllFixedBills()]).then(
      ([profile, fixedBills]) => {
        const includedTotal = fixedBillService.sumIncludedFixedBills(fixedBills);
        reset({
          salary1: profile.salary1 ? String(Math.round(profile.salary1 * 100)) : "",
          salary2: profile.salary2 ? String(Math.round(profile.salary2 * 100)) : "",
          salary3: profile.salary3 ? String(Math.round(profile.salary3 * 100)) : "",
          billAmount: includedTotal ? String(Math.round(includedTotal * 100)) : "",
        });
      }
    );
  }, [reset]);

  useEffect(() => {
    return onFixedBillsUpdated(() => {
      fixedBillService.getAllFixedBills().then((fixedBills) => {
        const includedTotal = fixedBillService.sumIncludedFixedBills(fixedBills);
        setValue("billAmount", includedTotal ? String(Math.round(includedTotal * 100)) : "");
      });
    });
  }, [setValue]);

  const values = useWatch({ control });
  const sumSalaries =
    parseCurrencyInput(values.salary1 ?? "") +
    parseCurrencyInput(values.salary2 ?? "") +
    parseCurrencyInput(values.salary3 ?? "");
  const bill = parseCurrencyInput(values.billAmount ?? "");

  function handleClear() {
    reset({ salary1: "", salary2: "", salary3: "", billAmount: "" });
    setError(undefined);
    onResult(null);
  }

  function onSubmit(data: CalculateFormValues) {
    setError(undefined);
    startTransition(async () => {
      const billAmount = parseCurrencyInput(data.billAmount);
      const response = await calculateAction({
        salary1: parseCurrencyInput(data.salary1),
        salary2: parseCurrencyInput(data.salary2),
        salary3: parseCurrencyInput(data.salary3),
        billAmount,
      });
      if (response.error) setError(response.error);
      if (response.result) {
        onResult({ result: response.result, bill: billAmount });
        if (!response.error) {
          toast.success("Cálculo salvo no histórico.");
          emitHistoryUpdated();
        }
      }
    });
  }

  return (
    <Card className="rotate-[0.3deg]">
      <div className="mb-1.5 text-center">
        <ReceiptTitle className="tracking-[0.1em]">CALCULADORA</ReceiptTitle>
        <p className="mt-0.5 text-[11.5px] uppercase tracking-[0.12em] text-ink-faint">
          salário 1 como prioritário
        </p>
        <StarDivider className="mt-2 text-center" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-[18px]">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-[13px] font-bold tracking-[0.1em] text-ink">1. SALÁRIO 1</span>
            <span className="inline-block -rotate-3 rounded-[4px] border-2 border-red px-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red opacity-85">
              prioritário
            </span>
          </div>
          <Controller
            control={control}
            name="salary1"
            render={({ field }) => (
              <CurrencyInput id="salary1" className={amountClass} value={field.value} onValueChange={field.onChange} />
            )}
          />
        </div>

        <div className="mb-[18px]">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-[13px] font-bold tracking-[0.1em] text-blue">2. SALÁRIO 2</span>
            <span className="text-[11.5px] text-ink-faint">(proporcional do excedente)</span>
          </div>
          <Controller
            control={control}
            name="salary2"
            render={({ field }) => (
              <CurrencyInput id="salary2" className={amountClass} value={field.value} onValueChange={field.onChange} />
            )}
          />
        </div>

        <div className="mb-[22px]">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-[13px] font-bold tracking-[0.1em] text-red">3. SALÁRIO 3</span>
            <span className="text-[11.5px] text-ink-faint">(proporcional do excedente)</span>
          </div>
          <Controller
            control={control}
            name="salary3"
            render={({ field }) => (
              <CurrencyInput id="salary3" className={amountClass} value={field.value} onValueChange={field.onChange} />
            )}
          />
        </div>

        <div className="mb-5 border-t-2 border-dashed border-rule-faint pt-[18px]">
          <div className="mb-1 text-[13px] font-bold tracking-[0.1em] text-ink">$ VALOR DA CONTA</div>
          <Controller
            control={control}
            name="billAmount"
            render={({ field }) => (
              <CurrencyInput id="billAmount" className={amountClass} value={field.value} onValueChange={field.onChange} />
            )}
          />
        </div>

        <div className="mb-[22px] border-[3px] border-double border-ink px-3 py-3 sm:px-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-0.5 text-[13px] sm:flex-nowrap sm:text-[13.5px]">
            <span className="text-ink-soft">Soma dos salários</span>
            <span className="leader hidden sm:block" />
            <span className="font-bold text-ink">{formatCurrencyBRL(sumSalaries)}</span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-0.5 text-[13px] sm:flex-nowrap sm:text-[13.5px]">
            <span className="text-ink-soft">Valor da conta</span>
            <span className="leader hidden sm:block" />
            <span className="font-bold text-ink">{formatCurrencyBRL(bill)}</span>
          </div>
        </div>

        {error && (
          <p className="mb-4 border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">!! {error}</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr]">
          <Button type="button" variant="outline" onClick={handleClear}>
            Limpar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calcular"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
