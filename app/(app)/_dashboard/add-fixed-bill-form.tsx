"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { createFixedBillAction } from "@/actions/fixed-bill.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { parseCurrencyInput } from "@/lib/utils";
import {
  createFixedBillFormSchema,
  fixedBillCategories,
  fixedBillPayers,
  type CreateFixedBillFormValues,
} from "@/schemas/fixed-bill.schema";
import { PAYER_LABELS } from "@/services/fixed-bill.service";

interface AddFixedBillFormProps {
  onDone: () => void;
  onCancel: () => void;
}

export function AddFixedBillForm({ onDone, onCancel }: AddFixedBillFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState } = useForm<CreateFixedBillFormValues>({
    resolver: zodResolver(createFixedBillFormSchema),
    defaultValues: {
      name: "",
      amount: "",
      category: fixedBillCategories[0],
      payer: fixedBillPayers[0],
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
      className="mb-5 flex flex-col gap-3 rounded-xl border border-border/8 bg-input p-5"
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nome da conta" htmlFor="bill-name" error={formState.errors.name?.message}>
          <Input id="bill-name" {...register("name")} />
        </FormField>
        <FormField label="Valor (R$)" htmlFor="bill-amount" error={formState.errors.amount?.message}>
          <Input id="bill-amount" inputMode="decimal" {...register("amount")} />
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-3">
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
        <FormField label="Pago por" htmlFor="bill-payer">
          <Select id="bill-payer" {...register("payer")}>
            {fixedBillPayers.map((payer) => (
              <option key={payer} value={payer}>
                {PAYER_LABELS[payer]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      {error && <p className="text-[13px] text-danger-soft">{error}</p>}
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
