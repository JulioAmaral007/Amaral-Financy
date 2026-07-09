"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteAssetAction } from "@/actions/investment.actions";
import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { cn } from "@/lib/utils";
import { ASSET_CLASS_ORDER } from "@/services/investment-math.service";
import type { AssetView } from "@/services/investment-view.service";

type SortKey = "valor" | "rentab" | "classe";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "valor", label: "Valor" },
  { key: "rentab", label: "Rentab." },
  { key: "classe", label: "Classe" },
];

interface AssetsTableProps {
  assets: AssetView[];
  onEditAsset: (asset: AssetView) => void;
}

function sortAssets(assets: AssetView[], sort: SortKey): AssetView[] {
  return [...assets].sort((a, b) => {
    if (sort === "rentab") return b.returnPct - a.returnPct;
    if (sort === "classe") {
      return ASSET_CLASS_ORDER.indexOf(a.assetClass) - ASSET_CLASS_ORDER.indexOf(b.assetClass);
    }
    return b.value - a.value;
  });
}

export function AssetsTable({ assets, onEditAsset }: AssetsTableProps) {
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>("valor");
  const [isPending, startTransition] = useTransition();

  function handleRemove(asset: AssetView) {
    startTransition(async () => {
      const result = await deleteAssetAction({ id: asset.id });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  const sorted = sortAssets(assets, sort);
  const countLabel = assets.length === 1 ? "1 ativo" : `${assets.length} ativos`;

  return (
    <Card className="-rotate-[0.15deg]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="text-[18px] tracking-[0.08em] sm:text-[22px]">MEUS ATIVOS</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">{countLabel} na carteira</p>
        </div>
        <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">ordenar</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              className={cn(
                "cursor-pointer text-[12px] uppercase tracking-[0.1em]",
                sort === option.key
                  ? "font-bold text-ink underline decoration-red decoration-wavy underline-offset-4"
                  : "font-normal text-ink-faint hover:text-ink"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <StarDivider className="mb-2 mt-2.5" />

      {assets.length === 0 ? (
        <div className="mt-2 border-2 border-dashed border-rule py-9 text-center text-[13.5px] text-ink-faint">
          Nenhum ativo na carteira ainda. Aperte &quot;+ Novo ativo&quot; para começar.
        </div>
      ) : (
        <>
          <div className="flex items-baseline border-b-[2.5px] border-ink pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            <span className="min-w-0 flex-1">Ativo</span>
            <span className="hidden w-[80px] flex-none text-right sm:block">Qtd</span>
            <span className="hidden w-[104px] flex-none text-right lg:block">Preço médio</span>
            <span className="hidden w-[104px] flex-none text-right md:block">Atual</span>
            <span className="w-[92px] flex-none text-right sm:w-[112px]">Valor</span>
            <span className="w-[64px] flex-none text-right sm:w-[78px]">Rentab.</span>
            <span className="w-[28px] flex-none" />
          </div>

          <div className="flex flex-col">
            {sorted.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center border-b border-dashed border-rule-faint py-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span
                    aria-hidden
                    className="hidden flex-none border-2 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] opacity-85 sm:inline-block"
                    style={{ borderColor: asset.classColor, color: asset.classColor }}
                  >
                    {asset.classShort}
                  </span>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onEditAsset(asset)}
                      className="cursor-pointer text-left text-[14px] font-bold tracking-[0.03em] text-ink hover:underline"
                    >
                      {asset.ticker}
                    </button>
                    <div className="truncate text-[11.5px] text-ink-faint">{asset.name}</div>
                  </div>
                </div>
                <span className="hidden w-[80px] flex-none text-right text-[13px] text-ink-soft sm:block">
                  {asset.quantityLabel}
                </span>
                <span className="hidden w-[104px] flex-none text-right text-[13px] text-ink-soft lg:block">
                  {asset.avgPriceFormatted}
                </span>
                <span className="hidden w-[104px] flex-none text-right text-[13px] text-ink md:block">
                  {asset.currentPriceFormatted}
                </span>
                <span className="w-[92px] flex-none text-right text-[12.5px] font-bold text-ink sm:w-[112px] sm:text-[13.5px]">
                  {asset.valueFormatted}
                </span>
                <span
                  className={cn(
                    "w-[64px] flex-none text-right text-[12.5px] font-bold sm:w-[78px] sm:text-[13px]",
                    asset.returnPositive ? "text-green" : "text-red"
                  )}
                >
                  {asset.returnLabel}
                </span>
                <span className="w-[28px] flex-none text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(asset)}
                    disabled={isPending}
                    aria-label={`Remover ${asset.ticker}`}
                    className="cursor-pointer px-1 py-0.5 text-[17px] text-ink-faint transition-colors hover:text-red disabled:opacity-50"
                  >
                    ×
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
