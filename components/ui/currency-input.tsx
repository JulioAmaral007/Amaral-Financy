"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { formatCurrencyBRL, normalizeCurrencyDigits } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type" | "inputMode"> {
  value: string;
  onValueChange: (value: string) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const displayValue = value ? formatCurrencyBRL(Number(value) / 100) : "";

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      onValueChange(normalizeCurrencyDigits(event.target.value));
    }

    return (
      <Input
        ref={ref}
        inputMode="decimal"
        placeholder="R$ 0,00"
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
