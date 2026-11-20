import { Suspense } from "react";

import { BackupSection } from "./_dashboard/backup-section";
import { CalculatorSection } from "./_dashboard/calculator-section";
import { FixedBillsSection } from "./_dashboard/fixed-bills-section";
import { HistorySection } from "./_dashboard/history-section";
import { SectionNav } from "./_dashboard/section-nav";
import { SpendingSection } from "./_dashboard/spending-section";
import { YearRuler } from "./_dashboard/year-ruler";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <YearRuler />
      <div className="flex flex-col gap-3 sm:gap-4">
        <CalculatorSection />
        {/* Desktop: gastos à esquerda; contas e divisões empilhadas à direita, sem buraco embaixo. */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 lg:items-start">
          <SpendingSection />
          <div className="flex flex-col gap-3 sm:gap-4">
            <FixedBillsSection />
            <HistorySection />
          </div>
        </div>
        <BackupSection />
      </div>
      <SectionNav />
    </Suspense>
  );
}
