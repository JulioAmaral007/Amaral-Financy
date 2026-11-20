"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createSpendingAction, updateSpendingAction } from "@/actions/spending.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { defaultDateForMonth, monthDateBounds } from "@/lib/month";
import { emitMonthDataUpdated } from "@/lib/month-events";
import { parseCurrencyInput } from "@/lib/utils";
import { spendingCategories, spendingFormSchema, type SpendingFormValues } from "@/schemas/spending.schema";
import type { Spending, SpendingCategory } from "@/types/month";

interface SpendingFormProps {
  month: string;
  /** Presente ao editar; ausente ao lançar um gasto novo. */
  spending?: Spending;
  defaultCategory?: SpendingCategory;
  onDone: () => void;
  onCancel: () => void;
}

export function SpendingForm({ month, spending, defaultCategory, onDone, onCancel }: SpendingFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const idSuffix = spending?.id ?? "new";
  const bounds = monthDateBounds(month);

  const { register, control, handleSubmit, formState, reset } = useForm<SpendingFormValues>({
    resolver: zodResolver(spendingFormSchema),
    defaultValues: {
      category: spending?.category ?? defaultCategory ?? spendingCategories[0],
      date: spending?.date ?? defaultDateForMonth(month),
      amount: spending ? String(Math.round(spending.amount * 100)) : "",
      note: spending?.note ?? "",
    },
  });

  function onSubmit(data: SpendingFormValues) {
    setError(undefined);
    startTransition(async () => {
      const input = {
        category: data.category,
        date: data.date,
        amount: parseCurrencyInput(data.amount),
        note: data.note,
      };
      const result = spending
        ? await updateSpendingAction(spending.id, input)
        : await createSpendingAction(input);

      if (result.error) {
        setError(result.error);
        return;
      }

      emitMonthDataUpdated();
      if (spending) {
        onDone();
      } else {
        // Lançando vários gastos seguidos: mantém o formulário aberto, só limpa valor e observação.
        toast.success("Gasto lançado.");
        reset({ ...data, amount: "", note: "" });
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-4 flex flex-col gap-3 border-[1.5px] border-rule-faint bg-paper-dim p-[18px]"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Categoria" htmlFor={`spending-category-${idSuffix}`}>
          <Select id={`spending-category-${idSuffix}`} {...register("category")}>
            {spendingCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Data" htmlFor={`spending-date-${idSuffix}`} error={formState.errors.date?.message}>
          <Input
            id={`spending-date-${idSuffix}`}
            type="date"
            min={bounds.min}
            max={bounds.max}
            {...register("date")}
          />
        </FormField>
        <FormField label="Valor (R$)" htmlFor={`spending-amount-${idSuffix}`} error={formState.errors.amount?.message}>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                id={`spending-amount-${idSuffix}`}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </FormField>
        <FormField
          label="Observação (opcional)"
          htmlFor={`spending-note-${idSuffix}`}
          error={formState.errors.note?.message}
        >
          <Input id={`spending-note-${idSuffix}`} {...register("note")} />
        </FormField>
      </div>
      {error && <p className="text-[12.5px] text-red">!! {error}</p>}
      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel}>
          {spending ? "Cancelar" : "Fechar"}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : spending ? "Salvar" : "Lançar gasto"}
        </Button>
      </div>
    </form>
  );
}
