"use client";

import { useState } from "react";

import { CalculatorForm, type CalculatorResultPayload } from "./calculator-form";
import { CalculatorResultPanel } from "./calculator-result-panel";

export function CalculatorSection() {
  const [payload, setPayload] = useState<CalculatorResultPayload | null>(null);

  return (
    <section className="flex flex-col gap-8 lg:sticky lg:top-24">
      <CalculatorForm onResult={setPayload} />
      <CalculatorResultPanel payload={payload} />
    </section>
  );
}
