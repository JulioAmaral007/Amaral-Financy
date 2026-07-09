import { Card } from "@/components/ui/card";
import { LeaderRow, ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { formatCurrencyBRL } from "@/lib/utils";
import type { ArchivedCycleView } from "@/services/pj.service";

interface PjHistoryDetailProps {
  cycle: ArchivedCycleView;
  onBack: () => void;
}

export function PjHistoryDetail({ cycle: cycleView, onBack }: PjHistoryDetailProps) {
  const { cycle, periodLabel } = cycleView;
  const diff = (cycle.receivedValue ?? 0) - (cycle.predictedValue ?? 0);
  const positive = diff >= 0;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-[18px] cursor-pointer text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
      >
        &lt;- Voltar
      </button>

      <Card className="max-w-[560px] rotate-[0.25deg]">
        <div className="mb-4 text-center">
          <ReceiptTitle className="text-[22px] tracking-[0.08em]">CICLO {periodLabel}</ReceiptTitle>
          <StarDivider className="mt-2 text-center" />
        </div>

        <LeaderRow label="Valor previsto" value={formatCurrencyBRL(cycle.predictedValue ?? 0)} className="py-2 text-[14px]" />
        <LeaderRow
          label="Valor recebido"
          value={formatCurrencyBRL(cycle.receivedValue ?? 0)}
          valueClassName="text-blue"
          className="py-2 text-[14px]"
        />
        <LeaderRow
          label="Diferença"
          value={`${positive ? "+" : ""}${formatCurrencyBRL(diff)}`}
          valueClassName={positive ? "text-blue" : "text-red"}
          className="py-2 text-[14px]"
        />
        <LeaderRow label="Horas previstas" value={`${Math.round(cycle.predictedHours ?? 0)}h`} className="py-2 text-[14px]" />
        <LeaderRow label="Horas realizadas" value={`${Math.round(cycle.workedHours ?? 0)}h`} className="py-2 text-[14px]" />
        <LeaderRow label="Valor da hora" value={formatCurrencyBRL(cycle.hourlyRate)} className="py-2 text-[14px]" />
      </Card>
    </div>
  );
}
