"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { updateHistoryEntryAction } from "@/actions/history.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { PERSON_LABELS } from "@/lib/people";
import { parseCurrencyInput } from "@/lib/utils";
import {
  updateHistoryEntryFormSchema,
  type UpdateHistoryEntryFormValues,
} from "@/schemas/history.schema";
import type { HistoryEntry } from "@/types/history";

interface EditHistoryEntryFormProps {
  entry: HistoryEntry;
  onDone: () => void;
  onCancel: () => void;
}

export function EditHistoryEntryForm({ entry, onDone, onCancel }: EditHistoryEntryFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<UpdateHistoryEntryFormValues>({
    resolver: zodResolver(updateHistoryEntryFormSchema),
    defaultValues: {
      billAmount: String(Math.round(entry.billAmount * 100)),
      salary1Payment: String(Math.round(entry.salary1Payment * 100)),
      salary2Payment: String(Math.round(entry.salary2Payment * 100)),
      salary3Payment: String(Math.round(entry.salary3Payment * 100)),
    },
  });

  function onSubmit(data: UpdateHistoryEntryFormValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await updateHistoryEntryAction(entry.id, {
        billAmount: parseCurrencyInput(data.billAmount),
        salary1Payment: parseCurrencyInput(data.salary1Payment),
        salary2Payment: parseCurrencyInput(data.salary2Payment),
        salary3Payment: parseCurrencyInput(data.salary3Payment),
      });
      if (result.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="my-2 flex flex-col gap-4 rounded-[22px] bg-sunken p-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FormField label="Total" htmlFor={`edit-history-bill-${entry.id}`}>
          <Controller
            control={control}
            name="billAmount"
            render={({ field }) => (
              <CurrencyInput
                id={`edit-history-bill-${entry.id}`}
                value={field.value}
                onValueChange={field.onChange}
                wrapperClassName="bg-surface"
              />
            )}
          />
        </FormField>
        <FormField label={PERSON_LABELS.salary1} htmlFor={`edit-history-s1-${entry.id}`}>
          <Controller
            control={control}
            name="salary1Payment"
            render={({ field }) => (
              <CurrencyInput
                id={`edit-history-s1-${entry.id}`}
                value={field.value}
                onValueChange={field.onChange}
                wrapperClassName="bg-surface"
              />
            )}
          />
        </FormField>
        <FormField label={PERSON_LABELS.salary2} htmlFor={`edit-history-s2-${entry.id}`}>
          <Controller
            control={control}
            name="salary2Payment"
            render={({ field }) => (
              <CurrencyInput
                id={`edit-history-s2-${entry.id}`}
                value={field.value}
                onValueChange={field.onChange}
                wrapperClassName="bg-surface"
              />
            )}
          />
        </FormField>
        <FormField label={PERSON_LABELS.salary3} htmlFor={`edit-history-s3-${entry.id}`}>
          <Controller
            control={control}
            name="salary3Payment"
            render={({ field }) => (
              <CurrencyInput
                id={`edit-history-s3-${entry.id}`}
                value={field.value}
                onValueChange={field.onChange}
                wrapperClassName="bg-surface"
              />
            )}
          />
        </FormField>
      </div>
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
