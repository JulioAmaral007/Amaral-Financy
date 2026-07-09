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
import { parseCurrencyInput } from "@/lib/utils";
import {
  createFixedBillFormSchema,
  fixedBillCategories,
  type CreateFixedBillFormValues,
} from "@/schemas/fixed-bill.schema";

interface AddFixedBillFormProps {
  onDone: () => void;
  onCancel: () => void;
}

export function AddFixedBillForm({ onDone, onCancel }: AddFixedBillFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { register, control, handleSubmit, formState } = useForm<CreateFixedBillFormValues>({
    resolver: zodResolver(createFixedBillFormSchema),
    defaultValues: {
      name: "",
      amount: "",
      category: fixedBillCategories[0],
      payer: "split",
      dueDay: "",
    },
  });

  function onSubmit(data: CreateFixedBillFormValues) {
    setError(undefined);
    startTransition(async () => {
      const result = await createFixedBillAction({
        name: data.name,
        amount: parseCurrencyInput(data.amount),
        category: data.category,
        payer: data.payer,
        dueDay: Number(data.dueDay),
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
      className="mb-4 flex flex-col gap-3 border-[1.5px] border-rule-faint bg-paper-dim p-[18px]"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Nome da conta" htmlFor="bill-name" error={formState.errors.name?.message}>
          <Input id="bill-name" {...register("name")} />
        </FormField>
        <FormField label="Valor (R$)" htmlFor="bill-amount" error={formState.errors.amount?.message}>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput id="bill-amount" value={field.value} onValueChange={field.onChange} />
            )}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Dia venc." htmlFor="bill-due-day" error={formState.errors.dueDay?.message}>
          <Input id="bill-due-day" inputMode="numeric" {...register("dueDay")} />
        </FormField>
        <FormField label="Categoria" htmlFor="bill-category">
          <Select id="bill-category" {...register("category")}>
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
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Conta"}
        </Button>
      </div>
    </form>
  );
}
