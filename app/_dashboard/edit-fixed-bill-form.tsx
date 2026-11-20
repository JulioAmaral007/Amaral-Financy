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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-1 flex flex-col gap-3 border-[1.5px] border-rule-faint bg-paper-dim p-[18px]"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Nome da conta" htmlFor={`edit-bill-name-${bill.id}`} error={formState.errors.name?.message}>
          <Input id={`edit-bill-name-${bill.id}`} {...register("name")} />
        </FormField>
        <FormField
          label="Valor (R$)"
          htmlFor={`edit-bill-amount-${bill.id}`}
          error={formState.errors.amount?.message}
        >
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput id={`edit-bill-amount-${bill.id}`} value={field.value} onValueChange={field.onChange} />
            )}
          />
        </FormField>
        <FormField label="Categoria" htmlFor={`edit-bill-category-${bill.id}`}>
          <Select id={`edit-bill-category-${bill.id}`} {...register("category")}>
            {fixedBillCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      {error && <p className="text-[12.5px] text-red">!! {error}</p>}
      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
