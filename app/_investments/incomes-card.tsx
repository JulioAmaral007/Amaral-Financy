"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createIncomeAction, deleteIncomeAction } from "@/actions/investment.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { LeaderRow, ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { parseCurrencyInput } from "@/lib/utils";
import { incomeFormSchema, type IncomeFormValues } from "@/schemas/investment.schema";
import type { IncomeRow } from "@/services/investment-view.service";

interface IncomesCardProps {
  incomes: IncomeRow[];
  totalFormatted: string;
  yieldOnCostLabel: string;
}

export function IncomesCard({ incomes, totalFormatted, yieldOnCostLabel }: IncomesCardProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: { receivedAt: new Date().toISOString().slice(0, 10), source: "", amount: "" },
  });

  function onSubmit(values: IncomeFormValues) {
    startTransition(async () => {
      const result = await createIncomeAction({
        receivedAt: values.receivedAt,
        source: values.source,
        amount: parseCurrencyInput(values.amount),
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      reset({ receivedAt: new Date().toISOString().slice(0, 10), source: "", amount: "" });
      setIsFormOpen(false);
      router.refresh();
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await deleteIncomeAction({ id });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="-rotate-[0.2deg]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <ReceiptTitle className="text-[18px] tracking-[0.08em] sm:text-[20px]">PROVENTOS</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">últimos 12 meses</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen((open) => !open)}
          className="cursor-pointer text-[12px] font-bold uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
        >
          {isFormOpen ? "Fechar" : "+ Lançar"}
        </button>
      </div>

      <StarDivider className="mb-3.5 mt-2" />

      {isFormOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-4 animate-fade-in border-2 border-dashed border-rule-faint p-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="income-date" className="mb-0.5 block text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                Data
              </label>
              <Input id="income-date" type="date" {...register("receivedAt")} />
            </div>
            <div>
              <label htmlFor="income-amount" className="mb-0.5 block text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                Valor
              </label>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <CurrencyInput id="income-amount" value={field.value} onValueChange={field.onChange} />
                )}
              />
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="income-source" className="mb-0.5 block text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
              Fonte
            </label>
            <Input id="income-source" placeholder="Ex: HGLG11" {...register("source")} />
          </div>
          {(errors.source || errors.amount || errors.receivedAt) && (
            <p className="mt-2 text-[12.5px] text-red">
              !! {errors.source?.message ?? errors.amount?.message ?? errors.receivedAt?.message}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={isPending} className="px-3 py-2 text-[11.5px]">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lançar provento"}
            </Button>
          </div>
        </form>
      )}

      {incomes.length === 0 ? (
        <div className="border-2 border-dashed border-rule py-7 text-center text-[13px] text-ink-faint">
          Nenhum provento lançado nos últimos 12 meses.
        </div>
      ) : (
        <div className="flex max-h-[150px] flex-col overflow-y-auto overflow-x-hidden">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="flex items-baseline gap-2 border-b border-dashed border-rule-faint py-1.5 text-[13px]"
            >
              <span className="w-[36px] flex-none text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                {income.monthLabel}
              </span>
              <span className="min-w-0 flex-1 truncate font-bold text-ink">{income.source}</span>
              <span className="font-bold text-green">{income.amountFormatted}</span>
              <button
                type="button"
                onClick={() => handleRemove(income.id)}
                disabled={isPending}
                aria-label={`Remover provento de ${income.source}`}
                className="flex-none cursor-pointer px-1 text-[15px] text-ink-faint transition-colors hover:text-red disabled:opacity-50"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2.5 border-t-2 border-dashed border-rule-faint pt-3">
        <LeaderRow label="Recebido no período" value={totalFormatted} valueClassName="text-green" />
        <LeaderRow label="Yield on cost (aprox.)" value={yieldOnCostLabel} />
      </div>
    </Card>
  );
}
