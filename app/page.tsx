import { Suspense } from "react";

import { CalculatorSection } from "./_dashboard/calculator-section";
import { FixedBillsSection } from "./_dashboard/fixed-bills-section";
import { HistorySection } from "./_dashboard/history-section";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex flex-col gap-14">
        <HistorySection />
        <CalculatorSection />
        <FixedBillsSection />
      </div>
    </Suspense>
  );
}
