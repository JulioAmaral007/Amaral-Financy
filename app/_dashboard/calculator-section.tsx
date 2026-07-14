"use client";

import { useState } from "react";

import { CalculatorForm, type CalculatorResultPayload } from "./calculator-form";
import { CalculatorResultPanel } from "./calculator-result-panel";

export function CalculatorSection() {
  const [payload, setPayload] = useState<CalculatorResultPayload | null>(null);

  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
      <CalculatorForm onResult={setPayload} />
      <CalculatorResultPanel payload={payload} />
    </section>
  );
}
