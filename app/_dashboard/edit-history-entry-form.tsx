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
      className="mb-1 flex flex-col gap-3 border-[1.5px] border-rule-faint bg-paper-dim p-[18px]"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FormField label="Valor da conta" htmlFor={`edit-history-bill-${entry.id}`}>
          <Controller
            control={control}
            name="billAmount"
            render={({ field }) => (
              <CurrencyInput
                id={`edit-history-bill-${entry.id}`}
                value={field.value}
                onValueChange={field.onChange}
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
              />
            )}
          />
        </FormField>
      </div>
      {error && <p className="text-[12.5px] text-red">!! {error}</p>}
      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
