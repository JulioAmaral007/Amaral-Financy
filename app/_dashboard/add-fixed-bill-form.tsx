"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { createFixedBillAction } from "@/actions/fixed-bill.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { emitFixedBillsUpdated } from "@/lib/fixed-bill-events";
import { parseCurrencyInput } from "@/lib/utils";
import {
  createFixedBillFormSchema,
  fixedBillCategories,
  type CreateFixedBillFormValues,
} from "@/schemas/fixed-bill.schema";

const CATEGORY_OPTIONS = fixedBillCategories.map((category) => ({ value: category, label: category }));

interface AddFixedBillFormProps {
  month: string;
  onDone: () => void;
  onCancel: () => void;
}

export function AddFixedBillForm({ month, onDone, onCancel }: AddFixedBillFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { register, control, handleSubmit, formState } = useForm<CreateFixedBillFormValues>({
    resolver: zodResolver(createFixedBillFormSchema),
    defaultValues: {
      name: "",
      amount: "",
      category: fixedBillCategories[0],
      payer: "split",
    },
  });

  function onSubmit(data: CreateFixedBillFormValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await createFixedBillAction({
        month,
        name: data.name,
        amount: parseCurrencyInput(data.amount),
        category: data.category,
        payer: data.payer,
      });
      if (result.error) {
        setError(result.error);
      } else {
        emitFixedBillsUpdated();
        onDone();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex flex-col gap-4 rounded-[22px] bg-sunken p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Conta" htmlFor="bill-name" error={formState.errors.name?.message}>
          <Input id="bill-name" placeholder="Ex.: Internet" autoFocus wrapperClassName="bg-surface" {...register("name")} />
        </FormField>
        <FormField label="Valor" htmlFor="bill-amount" error={formState.errors.amount?.message}>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                id="bill-amount"
                value={field.value}
                onValueChange={field.onChange}
                wrapperClassName="bg-surface"
              />
            )}
          />
        </FormField>
        <FormField label="Categoria" htmlFor="bill-category">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                ref={field.ref}
                id="bill-category"
                options={CATEGORY_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className="bg-surface"
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
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar conta"}
        </Button>
      </div>
    </form>
  );
}
