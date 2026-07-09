import { Suspense } from "react";

import { CalculatorSection } from "./_dashboard/calculator-section";
import { FixedBillsSection } from "./_dashboard/fixed-bills-section";
import { HistorySection } from "./_dashboard/history-section";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex flex-col gap-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <HistorySection />
          <CalculatorSection />
        </div>
        <FixedBillsSection />
      </div>
    </Suspense>
  );
}
