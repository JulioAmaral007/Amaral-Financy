"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AssetView, InvestmentsViewData } from "@/services/investment-view.service";

import { AllocationCard } from "./allocation-card";
import { AssetForm } from "./asset-form";
import { AssetsTable } from "./assets-table";
import { BenchmarkCard } from "./benchmark-card";
import { ContributionsCard } from "./contributions-card";
import { IncomesCard } from "./incomes-card";
import { InvestorProfileCard } from "./investor-profile-card";
import { PortfolioHero } from "./portfolio-hero";
import { ReserveCard } from "./reserve-card";
import { SimulatorCard } from "./simulator-card";

interface InvestmentsViewProps {
  data: InvestmentsViewData;
}

export function InvestmentsView({ data }: InvestmentsViewProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetView | null>(null);

  function closeForm() {
    setIsFormOpen(false);
    setEditingAsset(null);
  }

  function handleSaved() {
    closeForm();
    router.refresh();
  }

  if (isFormOpen) {
    return <AssetForm asset={editingAsset} onDone={handleSaved} onCancel={closeForm} />;
  }

  return (
    <div className="flex flex-col gap-9 sm:gap-14">
      <PortfolioHero
        portfolio={data.portfolio}
        onNewAsset={() => {
          setEditingAsset(null);
          setIsFormOpen(true);
        }}
      />

      <BenchmarkCard benchmarks={data.benchmarks} monthLabel={data.benchmarkMonthLabel} />

      <AllocationCard
        allocation={data.allocation}
        investorProfile={data.settings.investorProfile}
        hasAssets={data.assets.length > 0}
      />

      <div className="grid grid-cols-1 gap-9 lg:grid-cols-2 lg:gap-14">
        <ReserveCard reserve={data.reserve} settings={data.settings} />
        <InvestorProfileCard
          settings={data.settings}
          description={data.profileDescription}
          targets={data.profileTargets}
        />
      </div>

      <AssetsTable
        assets={data.assets}
        onEditAsset={(asset) => {
          setEditingAsset(asset);
          setIsFormOpen(true);
        }}
      />

      <div className="grid grid-cols-1 gap-9 lg:grid-cols-2 lg:gap-14">
        <ContributionsCard
          contributions={data.contributions}
          totalFormatted={data.contributionsTotalFormatted}
          averageFormatted={data.contributionsAverageFormatted}
        />
        <IncomesCard
          incomes={data.incomes}
          totalFormatted={data.incomesTotalFormatted}
          yieldOnCostLabel={data.yieldOnCostLabel}
        />
      </div>

      <SimulatorCard initialValue={data.totalValue} cdiBaseRate={data.cdiBaseRate} />
    </div>
  );
}
