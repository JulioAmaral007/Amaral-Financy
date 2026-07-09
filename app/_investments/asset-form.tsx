"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { createAssetAction, updateAssetAction } from "@/actions/investment.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { Select } from "@/components/ui/select";
import { parseCurrencyInput, parseDecimalInput } from "@/lib/utils";
import { assetClasses, assetFormSchema, type AssetFormValues } from "@/schemas/investment.schema";
import { ASSET_CLASS_META } from "@/services/investment-math.service";
import type { AssetView } from "@/services/investment-view.service";

interface AssetFormProps {
  asset: AssetView | null;
  onDone: () => void;
  onCancel: () => void;
}

function toCentsString(value: number): string {
  return value ? String(Math.round(value * 100)) : "";
}

export function AssetForm({ asset, onDone, onCancel }: AssetFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: asset
      ? {
          id: asset.id,
          ticker: asset.ticker,
          name: asset.name,
          assetClass: asset.assetClass,
          quantity: String(asset.quantity).replace(".", ","),
          avgPrice: toCentsString(asset.avgPrice),
          currentPrice: toCentsString(asset.currentPrice),
        }
      : {
          ticker: "",
          name: "",
          assetClass: "acao",
          quantity: "",
          avgPrice: "",
          currentPrice: "",
        },
  });

  function onSubmit(values: AssetFormValues) {
    setError(undefined);
    startTransition(async () => {
      const input = {
        ticker: values.ticker,
        name: values.name,
        assetClass: values.assetClass,
        quantity: parseDecimalInput(values.quantity),
        avgPrice: parseCurrencyInput(values.avgPrice),
        currentPrice: parseCurrencyInput(values.currentPrice),
      };

      const result = values.id
        ? await updateAssetAction({ ...input, id: values.id })
        : await createAssetAction(input);

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
          <ReceiptTitle className="text-[20px] tracking-[0.1em] sm:text-[23px]">
            {asset ? "EDITAR ATIVO" : "NOVO ATIVO"}
          </ReceiptTitle>
          <StarDivider className="mt-2 text-center" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Ticker" htmlFor="asset-ticker" error={errors.ticker?.message}>
              <Input id="asset-ticker" placeholder="Ex: PETR4" autoCapitalize="characters" {...register("ticker")} />
            </FormField>
            <FormField label="Classe" htmlFor="asset-class">
              <Select id="asset-class" {...register("assetClass")}>
                {assetClasses.map((assetClass) => (
                  <option key={assetClass} value={assetClass}>
                    {ASSET_CLASS_META[assetClass].label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Nome do ativo" htmlFor="asset-name" error={errors.name?.message}>
            <Input id="asset-name" placeholder="Ex: Petrobras PN" {...register("name")} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Quantidade" htmlFor="asset-quantity" error={errors.quantity?.message}>
              <Input id="asset-quantity" inputMode="decimal" placeholder="0" {...register("quantity")} />
            </FormField>
            <FormField label="Preço médio" htmlFor="asset-avg-price" error={errors.avgPrice?.message}>
              <Controller
                control={control}
                name="avgPrice"
                render={({ field }) => (
                  <CurrencyInput id="asset-avg-price" value={field.value} onValueChange={field.onChange} />
                )}
              />
            </FormField>
            <FormField label="Preço atual" htmlFor="asset-current-price" error={errors.currentPrice?.message}>
              <Controller
                control={control}
                name="currentPrice"
                render={({ field }) => (
                  <CurrencyInput id="asset-current-price" value={field.value} onValueChange={field.onChange} />
                )}
              />
            </FormField>
          </div>

          {error && <p className="border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">!! {error}</p>}

          <div className="flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar ativo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
