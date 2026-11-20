"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { updateFixedBillAction } from "@/actions/fixed-bill.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { parseCurrencyInput } from "@/lib/utils";
import {
  fixedBillCategories,
  updateFixedBillFormSchema,
  type UpdateFixedBillFormValues,
} from "@/schemas/fixed-bill.schema";
import type { FixedBillView } from "@/services/fixed-bill.service";

interface EditFixedBillFormProps {
  bill: FixedBillView;
  onDone: () => void;
  onCancel: () => void;
}

export function EditFixedBillForm({ bill, onDone, onCancel }: EditFixedBillFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { register, control, handleSubmit, formState } = useForm<UpdateFixedBillFormValues>({
    resolver: zodResolver(updateFixedBillFormSchema),
    defaultValues: {
      name: bill.name,
      amount: String(Math.round(bill.amount * 100)),
      category: bill.category,
    },
  });

  function onSubmit(data: UpdateFixedBillFormValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await updateFixedBillAction(bill.id, {
        name: data.name,
        amount: parseCurrencyInput(data.amount),
        category: data.category,
      });
      if (result.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="my-2 flex flex-col gap-4 rounded-[22px] bg-sunken p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Conta" htmlFor={`edit-bill-name-${bill.id}`} error={formState.errors.name?.message}>
          <Input id={`edit-bill-name-${bill.id}`} wrapperClassName="bg-surface" {...register("name")} />
        </FormField>
        <FormField label="Valor" htmlFor={`edit-bill-amount-${bill.id}`} error={formState.errors.amount?.message}>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                id={`edit-bill-amount-${bill.id}`}
                value={field.value}
                onValueChange={field.onChange}
                wrapperClassName="bg-surface"
              />
            )}
          />
        </FormField>
        <FormField label="Categoria" htmlFor={`edit-bill-category-${bill.id}`}>
          <Select id={`edit-bill-category-${bill.id}`} className="bg-surface" {...register("category")}>
            {fixedBillCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
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
