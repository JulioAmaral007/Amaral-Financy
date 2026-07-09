"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { configurePjCycleAction } from "@/actions/pj.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { cn, parseCurrencyInput } from "@/lib/utils";

const segClass = (active: boolean) =>
  cn(
    "flex-1 border-2 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer",
    active ? "border-ink bg-ink text-paper" : "border-rule bg-transparent text-ink-soft hover:text-ink"
  );
import { pjCycleConfigFormSchema, type PjCycleConfigFormValues } from "@/schemas/pj.schema";
import type { PjCycle } from "@/types/pj";

const WEEKDAY_CHIP_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const WEEKDAY_PRESET_OPTIONS: { value: PjCycleConfigFormValues["weekdayPreset"]; label: string }[] = [
  { value: "segsex", label: "Seg–Sex" },
  { value: "segsab", label: "Seg–Sáb" },
  { value: "custom", label: "Personalizado" },
];

interface PjCycleConfigFormProps {
  cycle: PjCycle | null;
  canCancel: boolean;
  onDone: () => void;
  onCancel: () => void;
}

function toCentsString(value: number): string {
  return value ? String(Math.round(value * 100)) : "";
}

export function PjCycleConfigForm({ cycle, canCancel, onDone, onCancel }: PjCycleConfigFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PjCycleConfigFormValues>({
    resolver: zodResolver(pjCycleConfigFormSchema),
    defaultValues: cycle
      ? {
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          hourlyRate: toCentsString(cycle.hourlyRate),
          journeyMode: "h8",
          journeyCustomHours: "",
          weekdayPreset: cycle.weekdayPreset,
          customWeekdays: cycle.customWeekdays,
        }
      : {
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
          hourlyRate: "",
          journeyMode: "h8",
          journeyCustomHours: "",
          weekdayPreset: "segsex",
          customWeekdays: [],
        },
  });

  const weekdayPreset = useWatch({ control, name: "weekdayPreset" });
  const customWeekdays = useWatch({ control, name: "customWeekdays" });

  function toggleWeekday(day: number) {
    const next = customWeekdays.includes(day)
      ? customWeekdays.filter((d) => d !== day)
      : [...customWeekdays, day].sort((a, b) => a - b);
    setValue("customWeekdays", next);
  }

  function onSubmit(data: PjCycleConfigFormValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await configurePjCycleAction({
        startDate: data.startDate,
        endDate: data.endDate,
        hourlyRate: parseCurrencyInput(data.hourlyRate),
        journeyMode: "h8",
        journeyCustomHours: null,
        weekdayPreset: data.weekdayPreset,
        customWeekdays: data.customWeekdays,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <div>
      {canCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mb-[18px] cursor-pointer text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
        >
          &lt;- Voltar
        </button>
      )}

      <Card className="max-w-[580px] rotate-[0.3deg]">
        <div className="mb-5 text-center">
          <ReceiptTitle className="text-[23px] tracking-[0.1em]">CONFIGURAR CICLO</ReceiptTitle>
          <StarDivider className="mt-2 text-center" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Data inicial" htmlFor="pj-start-date" error={errors.startDate?.message}>
              <Input id="pj-start-date" type="date" {...register("startDate")} />
            </FormField>
            <FormField label="Data final" htmlFor="pj-end-date" error={errors.endDate?.message}>
              <Input id="pj-end-date" type="date" {...register("endDate")} />
            </FormField>
          </div>

          <FormField label="Valor da hora (R$)" htmlFor="pj-hourly-rate" error={errors.hourlyRate?.message}>
            <Controller
              control={control}
              name="hourlyRate"
              render={({ field }) => (
                <CurrencyInput id="pj-hourly-rate" value={field.value} onValueChange={field.onChange} />
              )}
            />
          </FormField>

          <div className="border-t-2 border-dashed border-rule-faint pt-4">
            <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              Dias da semana trabalhados
            </div>
            <div className="flex gap-2">
              {WEEKDAY_PRESET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue("weekdayPreset", option.value)}
                  className={segClass(weekdayPreset === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {weekdayPreset === "custom" && (
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_CHIP_LABELS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleWeekday(index)}
                  className={cn(
                    "border-2 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer",
                    customWeekdays.includes(index)
                      ? "border-ink bg-ink text-paper"
                      : "border-rule bg-transparent text-ink-soft hover:text-ink"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">!! {error}</p>
          )}

          <div className="flex justify-end gap-2.5">
            {canCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar ciclo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
