import { formatCurrencyBRL } from "@/lib/utils";
import type { SalarySplitResult } from "@/types/bill-split";

interface CalculatorResultPanelProps {
  result: SalarySplitResult;
}

export function CalculatorResultPanel({ result }: CalculatorResultPanelProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <p className="mb-1 text-[16px] font-semibold text-foreground">Resultado da Divisão</p>

      <div className="flex items-center justify-between rounded-[10px] bg-primary/16 px-4 py-3.5">
        <span className="text-[13.5px] font-semibold text-foreground">Salário 1</span>
        <span className="font-mono font-bold text-primary-soft">{formatCurrencyBRL(result.salary1Payment)}</span>
      </div>

      <div className="flex items-center justify-between rounded-[10px] bg-blue/16 px-4 py-3.5">
        <span className="text-[13.5px] font-semibold text-foreground">Salário 2</span>
        <span className="font-mono font-bold text-blue-soft">{formatCurrencyBRL(result.salary2Payment)}</span>
      </div>

      <div className="flex items-center justify-between rounded-[10px] bg-purple/16 px-4 py-3.5">
        <span className="text-[13.5px] font-semibold text-foreground">Salário 3</span>
        <span className="font-mono font-bold text-purple-soft">{formatCurrencyBRL(result.salary3Payment)}</span>
      </div>

      {result.exceeds && (
        <div className="rounded-[10px] bg-danger/16 px-3.5 py-3 text-[13px] text-danger-soft">
          A conta excede a soma dos salários em {formatCurrencyBRL(result.shortfall)}.
        </div>
      )}
    </div>
  );
}
