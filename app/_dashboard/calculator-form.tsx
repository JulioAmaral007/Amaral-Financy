"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { calculateAction } from "@/actions/calculate.actions";
import { saveMonthInputsAction } from "@/actions/month.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { emitHistoryUpdated } from "@/lib/history-events";
import { PERSON_LABELS } from "@/lib/people";
import { cn, formatCurrencyBRL, parseCurrencyInput, round2 } from "@/lib/utils";
import { calculateFormSchema, type CalculateFormValues } from "@/schemas/calculate.schema";
import * as billSplitService from "@/services/bill-split.service";
import type { MonthSnapshot } from "@/services/month.service";
import type { SplitMode } from "@/types/month";

import { MonthTotalHeader } from "./month-total-header";
import { PERSON_COLORS, type PersonKey } from "./people-colors";
import { SplitBar } from "./split-bar";

interface CalculatorFormProps {
  snapshot: MonthSnapshot;
  /** Divisões já registradas neste mês. */
  historyCount: number;
  /** Total do mês anterior, para a variação. */
  previousTotal: number;
}

const SAVE_DELAY_MS = 500;

const SPLIT_MODE_OPTIONS: Array<{ value: SplitMode; label: string }> = [
  { value: "equal", label: "Meio a meio" },
  { value: "proportional", label: "Pelo salário" },
];

function toCents(value: number): string {
  return value ? String(Math.round(value * 100)) : "";
}

/**
 * O topo do dashboard: total do mês, a barra de quem paga quanto e, logo
 * abaixo, um cartão por pessoa com os valores que alimentam a divisão.
 */
export function CalculatorForm({ snapshot, historyCount, previousTotal }: CalculatorFormProps) {
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
      toast.success("Divisão registrada.");
      emitHistoryUpdated();
    });
  }

  const payments: Record<PersonKey, number> = {
    salary1: result?.salary1Payment ?? 0,
    salary2: result?.salary2Payment ?? 0,
    salary3: result?.salary3Payment ?? 0,
  };

  return (
    <Card id="mes" className="p-5 sm:p-7">
      <form onSubmit={handleSubmit(onSubmit)}>
        <MonthTotalHeader
          month={month}
          totals={totals}
          previousTotal={previousTotal}
          steps={[
            { todo: "lançar as contas", done: snapshot.bills.length > 0 },
            { todo: "lançar os gastos do cartão", done: snapshot.spendings.length > 0 },
            { todo: "registrar a divisão", done: historyCount > 0 },
          ]}
        />

        <SplitBar
          className="mt-5"
          shortfall={result?.exceeds ? result.shortfall : 0}
          segments={[
            { key: "salary1", label: PERSON_LABELS.salary1, value: payments.salary1 },
            { key: "salary2", label: PERSON_LABELS.salary2, value: payments.salary2 },
            { key: "salary3", label: PERSON_LABELS.salary3, value: payments.salary3 },
          ]}
        />

        <div className="mt-2 grid grid-cols-3 gap-2">
          <PersonCard person="salary1" amount={result ? payments.salary1 : null} hint="paga primeiro" />
          {(["salary2", "salary3"] as const).map((person) => (
            <PersonCard
              key={person}
              person={person}
              amount={result ? payments[person] : null}
              hint={splitMode === "equal" ? `metade de ${formatCurrencyBRL(remainder)}` : "pelo salário"}
            >
              {splitMode === "proportional" && <MoneyField control={control} name={person} label="Salário" />}
            </PersonCard>
          ))}
        </div>

        {/* Ajustes da divisão numa linha só: o que o Pai põe, como dividir o resto, registrar. */}
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3 border-t pt-4 sm:flex sm:flex-wrap sm:items-end sm:gap-3">
          <MoneyField control={control} name="inss" label="INSS" className="sm:w-36" />
          <MoneyField
            control={control}
            name="extraPai"
            label={`Extra ${PERSON_LABELS.salary1.toLowerCase()}`}
            className="sm:w-36"
          />
          <div className="col-span-2 sm:col-span-1">
            <span className="mb-1 block text-[12px] font-medium text-muted">Dividir o resto</span>
            <Controller
              control={control}
              name="splitMode"
              render={({ field }) => (
                <div
                  className="flex h-10 w-full rounded-full bg-ink/5 p-1 sm:w-fit"
                  role="radiogroup"
                  aria-label="Como dividir o resto"
                >
                  {SPLIT_MODE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === option.value}
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        "flex-1 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-[13.5px] font-semibold transition-all",
                        field.value === option.value ? "bg-surface text-ink shadow-pill" : "text-muted hover:text-ink"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <Button type="submit" disabled={isPending || bill <= 0} className="col-span-2 h-10 sm:ml-auto">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : historyCount > 0 ? (
              "Registrar de novo"
            ) : (
              "Registrar divisão"
            )}
          </Button>
        </div>

        {result?.exceeds && (
          <p className="mt-3 rounded-2xl bg-bad/8 px-4 py-2.5 text-[13.5px] text-bad">
            Os salários não cobrem o total: faltam {formatCurrencyBRL(result.shortfall)}.
          </p>
        )}
        {error && <p className="mt-3 rounded-2xl bg-bad/8 px-4 py-2.5 text-[13.5px] text-bad">{error}</p>}
      </form>
    </Card>
  );
}

function PersonCard({
  person,
  amount,
  hint,
  children,
}: {
  person: PersonKey;
  amount: number | null;
  hint: string;
  children?: React.ReactNode;
}) {
  const colors = PERSON_COLORS[person];
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-2xl bg-sunken px-2.5 py-2.5 sm:px-4 sm:py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink sm:text-[14px]">
          <span className={cn("h-2 w-2 flex-none rounded-full sm:h-2.5 sm:w-2.5", colors.dot)} />
          <span className="truncate">{PERSON_LABELS[person]}</span>
          <span className="hidden truncate font-normal text-muted sm:inline">· {hint}</span>
        </p>
        <p
          className={cn(
            "money mt-1 truncate text-[clamp(12.5px,3.6vw,16px)] font-bold leading-tight tracking-[-0.02em] sm:text-[22px]",
            amount === null ? "text-faint" : colors.text
          )}
        >
          {amount === null ? "—" : formatCurrencyBRL(amount)}
        </p>
      </div>
      {children}
    </div>
  );
}

function MoneyField({
  control,
  name,
  label,
  className,
}: {
  control: Control<CalculateFormValues>;
  name: "inss" | "extraPai" | "salary2" | "salary3";
  label: string;
  className?: string;
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="mb-1 block text-[12px] font-medium text-muted">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <CurrencyInput
            id={`hero-${name}`}
            value={field.value}
            onValueChange={field.onChange}
            wrapperClassName="h-10 rounded-xl px-3"
            className="text-[14.5px] font-medium"
          />
        )}
      />
    </label>
  );
}
