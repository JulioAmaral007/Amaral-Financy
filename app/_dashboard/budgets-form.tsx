"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { saveBudgetsAction } from "@/actions/month.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { emitMonthDataUpdated } from "@/lib/month-events";
import { parseCurrencyInput } from "@/lib/utils";
import { budgetsFormSchema, type BudgetsFormValues } from "@/schemas/month.schema";
import { spendingCategories } from "@/schemas/spending.schema";
import type { MonthKey, SpendingCategory } from "@/types/month";

interface BudgetsFormProps {
  month: MonthKey;
  budgets: Record<SpendingCategory, number>;
  onDone: () => void;
  onCancel: () => void;
}

function toCents(value: number): string {
  return value ? String(Math.round(value * 100)) : "";
}

/** Quanto se espera gastar em cada categoria no mês. */
export function BudgetsForm({ month, budgets, onDone, onCancel }: BudgetsFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<BudgetsFormValues>({
    resolver: zodResolver(budgetsFormSchema),
    defaultValues: {
      Carne: toCents(budgets.Carne),
      Gasolina: toCents(budgets.Gasolina),
      Mercado: toCents(budgets.Mercado),
      Outros: toCents(budgets.Outros),
    },
  });

  function onSubmit(data: BudgetsFormValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await saveBudgetsAction({
        month,
        budgets: {
          Carne: parseCurrencyInput(data.Carne),
          Gasolina: parseCurrencyInput(data.Gasolina),
          Mercado: parseCurrencyInput(data.Mercado),
          Outros: parseCurrencyInput(data.Outros),
        },
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      emitMonthDataUpdated();
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 flex flex-col gap-4 rounded-[22px] bg-sunken p-4">
      <p className="text-[13.5px] text-muted">Quanto vocês esperam gastar em cada categoria este mês?</p>
      <div className="grid grid-cols-2 gap-3">
        {spendingCategories.map((category) => (
          <FormField key={category} label={category} htmlFor={`budget-${category}`}>
            <Controller
              control={control}
              name={category}
              render={({ field }) => (
                <CurrencyInput
                  id={`budget-${category}`}
                  value={field.value}
                  onValueChange={field.onChange}
                  wrapperClassName="bg-surface"
                />
              )}
            />
          </FormField>
        ))}
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar estimativas"}
        </Button>
      </div>
    </form>
  );
}
