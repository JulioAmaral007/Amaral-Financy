"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { createGoalAction, updateGoalAction } from "@/actions/goal.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { Select } from "@/components/ui/select";
import { cn, formatPercent, parseCurrencyInput, parseDecimalInput } from "@/lib/utils";
import { goalCategories, goalFormSchema, goalPriorities, type GoalFormValues } from "@/schemas/goal.schema";
import { GOAL_CATEGORY_META, GOAL_PRIORITY_META } from "@/services/goal-math.service";
import type { GoalView } from "@/services/goal.service";

interface GoalFormProps {
  goal: GoalView | null;
  cdiBaseRate: number;
  onDone: () => void;
  onCancel: () => void;
}

function toCentsString(value: number): string {
  return value ? String(Math.round(value * 100)) : "";
}

export function GoalForm({ goal, cdiBaseRate, onDone, onCancel }: GoalFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: goal
      ? {
          id: goal.id,
          name: goal.name,
          description: goal.description,
          category: goal.category,
          targetValue: toCentsString(goal.targetValue),
          currentValue: toCentsString(goal.currentValue),
          initialContribution: toCentsString(goal.initialContribution),
          monthlyContribution: toCentsString(goal.monthlyContribution),
          startDate: goal.startDate,
          rateMode: goal.rateMode,
          cdiPercent: String(goal.cdiPercent),
          fixedAnnualRate: String(goal.fixedAnnualRate),
          priority: goal.priority,
        }
      : {
          name: "",
          description: "",
          category: "reserva",
          targetValue: "",
          currentValue: "",
          initialContribution: "",
          monthlyContribution: "",
          startDate: new Date().toISOString().slice(0, 10),
          rateMode: "cdi",
          cdiPercent: "100",
          fixedAnnualRate: "12",
          priority: "media",
        },
  });

  const rateMode = useWatch({ control, name: "rateMode" });
  const cdiPercent = useWatch({ control, name: "cdiPercent" });

  function onSubmit(data: GoalFormValues) {
    setError(undefined);
    startTransition(async () => {
      const input = {
        name: data.name,
        description: data.description,
        category: data.category,
        targetValue: parseCurrencyInput(data.targetValue),
        currentValue: parseCurrencyInput(data.currentValue),
        initialContribution: parseCurrencyInput(data.initialContribution),
        monthlyContribution: parseCurrencyInput(data.monthlyContribution),
        startDate: data.startDate,
        rateMode: data.rateMode,
        cdiPercent: parseDecimalInput(data.cdiPercent),
        fixedAnnualRate: parseDecimalInput(data.fixedAnnualRate),
        priority: data.priority,
      };

      const result = data.id ? await updateGoalAction({ ...input, id: data.id }) : await createGoalAction(input);

      if (result?.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        className="mb-[18px] cursor-pointer text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
      >
        &lt;- Voltar
      </button>

      <Card className="max-w-[640px] -rotate-[0.3deg]">
        <div className="mb-5 text-center">
          <ReceiptTitle className="text-[23px] tracking-[0.1em]">
            {goal ? "EDITAR META" : "NOVA META"}
          </ReceiptTitle>
          <StarDivider className="mt-2 text-center" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nome da meta" htmlFor="goal-name" error={errors.name?.message}>
            <Input id="goal-name" placeholder="Ex: Comprar uma casa" {...register("name")} />
          </FormField>

          <FormField label="Descrição (opcional)" htmlFor="goal-description">
            <textarea
              id="goal-description"
              rows={2}
              placeholder="Detalhes sobre esse objetivo"
              {...register("description")}
              className="w-full min-w-0 resize-y border-[1.5px] border-rule-faint bg-paper-dim px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint/70 outline-none focus:border-ink"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Categoria" htmlFor="goal-category">
              <Select id="goal-category" {...register("category")}>
                {goalCategories.map((category) => (
                  <option key={category} value={category}>
                    {GOAL_CATEGORY_META[category].label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Prioridade" htmlFor="goal-priority">
              <Select id="goal-priority" {...register("priority")}>
                {goalPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {GOAL_PRIORITY_META[priority].label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Valor alvo (R$)" htmlFor="goal-target" error={errors.targetValue?.message}>
            <Controller
              control={control}
              name="targetValue"
              render={({ field }) => (
                <CurrencyInput id="goal-target" value={field.value} onValueChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Valor já acumulado (R$)" htmlFor="goal-current">
            <Controller
              control={control}
              name="currentValue"
              render={({ field }) => (
                <CurrencyInput id="goal-current" value={field.value} onValueChange={field.onChange} />
              )}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Aporte inicial (R$)" htmlFor="goal-initial">
              <Controller
                control={control}
                name="initialContribution"
                render={({ field }) => (
                  <CurrencyInput id="goal-initial" value={field.value} onValueChange={field.onChange} />
                )}
              />
            </FormField>
            <FormField label="Aporte mensal (R$)" htmlFor="goal-monthly">
              <Controller
                control={control}
                name="monthlyContribution"
                render={({ field }) => (
                  <CurrencyInput id="goal-monthly" value={field.value} onValueChange={field.onChange} />
                )}
              />
            </FormField>
          </div>

          <FormField label="Data de início" htmlFor="goal-start-date" error={errors.startDate?.message}>
            <Input id="goal-start-date" type="date" {...register("startDate")} />
          </FormField>

          <div className="border-t-2 border-dashed border-rule-faint pt-4">
            <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              Modalidade de rendimento
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValue("rateMode", "cdi")}
                className={cn(
                  "flex-1 border-2 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer",
                  rateMode === "cdi"
                    ? "border-ink bg-ink text-paper"
                    : "border-rule bg-transparent text-ink-soft hover:text-ink"
                )}
              >
                % do CDI
              </button>
              <button
                type="button"
                onClick={() => setValue("rateMode", "fixed")}
                className={cn(
                  "flex-1 border-2 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer",
                  rateMode === "fixed"
                    ? "border-ink bg-ink text-paper"
                    : "border-rule bg-transparent text-ink-soft hover:text-ink"
                )}
              >
                Taxa fixa anual
              </button>
            </div>
          </div>

          {rateMode === "cdi" ? (
            <FormField label="Percentual do CDI" htmlFor="goal-cdi-percent">
              <div className="relative">
                <Input id="goal-cdi-percent" inputMode="decimal" className="pr-8" {...register("cdiPercent")} />
                <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[13px] text-ink-faint">
                  %
                </span>
              </div>
              <p className="mt-2 text-[12px] text-ink-faint">
                ≈ {formatPercent((parseDecimalInput(cdiPercent) / 100) * (cdiBaseRate / 100) * 100)} ao ano (CDI de
                referência: {cdiBaseRate}%)
              </p>
            </FormField>
          ) : (
            <FormField label="Taxa fixa anual" htmlFor="goal-fixed-rate">
              <div className="relative">
                <Input id="goal-fixed-rate" inputMode="decimal" className="pr-8" {...register("fixedAnnualRate")} />
                <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[13px] text-ink-faint">
                  %
                </span>
              </div>
            </FormField>
          )}

          {error && (
            <p className="border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">!! {error}</p>
          )}

          <div className="flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar meta"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
