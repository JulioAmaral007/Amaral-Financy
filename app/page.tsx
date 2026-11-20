import { Suspense } from "react";

import { BackupSection } from "./_dashboard/backup-section";
import { CalculatorSection } from "./_dashboard/calculator-section";
import { FixedBillsSection } from "./_dashboard/fixed-bills-section";
import { HistorySection } from "./_dashboard/history-section";
import { MonthBar } from "./_dashboard/month-bar";
import { SpendingSection } from "./_dashboard/spending-section";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex flex-col gap-14">
        <MonthBar />
        <HistorySection />
        <CalculatorSection />
        <SpendingSection />
        <FixedBillsSection />
        <BackupSection />
      </div>
    </Suspense>
  );
}
