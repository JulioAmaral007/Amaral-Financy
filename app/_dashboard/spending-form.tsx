"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { createSpendingAction, updateSpendingAction } from "@/actions/spending.actions";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { defaultDateForMonth, monthDateBounds } from "@/lib/month";
import { emitMonthDataUpdated } from "@/lib/month-events";
import { cn, formatCurrencyBRL, parseCurrencyInput, round2 } from "@/lib/utils";
import { spendingCategories, spendingFormSchema, type SpendingFormValues } from "@/schemas/spending.schema";
import type { Spending, SpendingCategory } from "@/types/month";

/** Opções do seletor de parcelas (1 = à vista). */
const INSTALLMENT_OPTIONS = [...Array.from({ length: 12 }, (_, i) => i + 1), 18, 24, 36, 48];

interface SpendingFormProps {
  month: string;
  /** Presente ao editar; ausente no lançamento rápido. */
  spending?: Spending;
  defaultCategory?: SpendingCategory;
  /** Só usados ao editar. */
  onDone?: () => void;
  onCancel?: () => void;
}

/**
 * Lançamento rápido: valor, categoria (um toque) e Enter. Fica sempre aberto;
 * depois de lançar, limpa valor e observação e mantém categoria e data.
 */
export function SpendingForm({ month, spending, defaultCategory, onDone, onCancel }: SpendingFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const idSuffix = spending?.id ?? "new";
  const bounds = monthDateBounds(month);

  const { register, control, handleSubmit, formState, reset, setFocus } = useForm<SpendingFormValues>({
    resolver: zodResolver(spendingFormSchema),
    defaultValues: {
      category: spending?.category ?? defaultCategory ?? spendingCategories[0],
      date: spending?.date ?? defaultDateForMonth(month),
      amount: spending ? String(Math.round(spending.amount * 100)) : "",
      note: spending?.note ?? "",
      installments: 1,
    },
  });
  const installments = useWatch({ control, name: "installments" });
  const amountDigits = useWatch({ control, name: "amount" });
  const installmentHint =
    !spending && installments > 1 && amountDigits
      ? `${installments}× de ${formatCurrencyBRL(round2(parseCurrencyInput(amountDigits) / installments))} · uma por mês a partir da data`
      : undefined;

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
        : await createSpendingAction({ ...input, installments: data.installments });

      if (result.error) {
        setError(result.error);
        return;
      }

      emitMonthDataUpdated();
      if (spending) {
        onDone?.();
      } else {
        toast.success(
          data.installments > 1
            ? `${data.installments}× de ${formatCurrencyBRL(round2(input.amount / data.installments))} em ${input.category} lançadas.`
            : `${formatCurrencyBRL(input.amount)} em ${input.category} lançado.`
        );
        reset({ ...data, amount: "", note: "", installments: 1 });
        setFocus("amount");
      }
    });
  }

  const fieldError = formState.errors.amount?.message ?? formState.errors.date?.message ?? formState.errors.note?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-3", spending ? "my-2 rounded-[22px] bg-sunken p-4" : "")}
    >
      {/*
        Celular: [valor][+] / categorias / [data][observação].
        Desktop: [valor][data][Lançar] / [categorias][observação].
      */}
      <div className="flex flex-wrap gap-2">
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <CurrencyInput
              ref={field.ref}
              id={`spending-amount-${idSuffix}`}
              aria-label="Valor do gasto"
              value={field.value}
              onValueChange={field.onChange}
              wrapperClassName="order-1 h-12 min-w-40 flex-1 rounded-[16px]"
              className="money text-[19px] font-bold"
            />
          )}
        />
        <Input
          id={`spending-date-${idSuffix}`}
          aria-label="Data"
          type="date"
          min={bounds.min}
          max={bounds.max}
          wrapperClassName="order-4 h-10 rounded-xl sm:order-2 sm:h-12 sm:rounded-[16px]"
          className="text-[14px]"
          {...register("date")}
        />
        {!spending && (
          <Select
            aria-label="Parcelas"
            className="order-4 h-10 w-auto rounded-xl text-[14px] sm:order-2 sm:h-12 sm:rounded-[16px]"
            {...register("installments", { valueAsNumber: true })}
          >
            {INSTALLMENT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "À vista" : `${n}x`}
              </option>
            ))}
          </Select>
        )}
        {!spending && (
          <Button type="submit" disabled={isPending} className="order-2 h-12 px-4 sm:order-3" aria-label="Lançar gasto">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" strokeWidth={2.5} />}
            <span className="hidden sm:inline">Lançar</span>
          </Button>
        )}

        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <div className="order-3 flex w-full flex-wrap gap-1 sm:order-4 sm:w-auto" role="radiogroup" aria-label="Categoria">
              {spendingCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="radio"
                  aria-checked={field.value === category}
                  onClick={() => field.onChange(category)}
                  className={cn(
                    "h-10 cursor-pointer rounded-full px-3 text-[13px] font-semibold transition-all sm:px-3.5 sm:text-[13.5px]",
                    field.value === category
                      ? "bg-ink text-on-ink"
                      : "bg-surface text-muted ring-1 ring-inset ring-line hover:text-ink hover:ring-ink/30"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        />
        <Input
          id={`spending-note-${idSuffix}`}
          aria-label="Observação"
          placeholder="Observação"
          wrapperClassName="order-5 h-10 min-w-32 flex-1 rounded-xl"
          className="text-[14px]"
          {...register("note")}
        />
      </div>

      {installmentHint && !fieldError && !error && <p className="text-[13px] text-muted">{installmentHint}</p>}
      {(fieldError || error) && <p className="text-[13px] text-bad">{fieldError ?? error}</p>}

      {spending && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      )}
    </form>
  );
}
