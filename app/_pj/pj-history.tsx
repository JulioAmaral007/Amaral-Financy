import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { formatCurrencyBRL } from "@/lib/utils";
import type { ArchivedCycleView } from "@/services/pj.service";

interface PjHistoryProps {
  cycles: ArchivedCycleView[];
  onBack: () => void;
  onOpen: (id: string) => void;
}

export function PjHistory({ cycles, onBack, onOpen }: PjHistoryProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-[18px] cursor-pointer text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
      >
        &lt;- Voltar
      </button>

      <Card className="max-w-[720px] -rotate-[0.3deg]">
        <div className="mb-4 text-center">
          <ReceiptTitle className="text-[23px] tracking-[0.1em]">HISTÓRICO DE CICLOS</ReceiptTitle>
          <StarDivider className="mt-2 text-center" />
        </div>

        {cycles.length === 0 ? (
          <div className="border-2 border-dashed border-rule py-9 text-center text-[13.5px] text-ink-faint">
            Nenhum ciclo encerrado ainda.
          </div>
        ) : (
          <div className="flex flex-col">
            {cycles.map(({ cycle, periodLabel }) => {
              const diff = (cycle.receivedValue ?? 0) - (cycle.predictedValue ?? 0);
              const positive = diff >= 0;

              return (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => onOpen(cycle.id)}
                  className="flex cursor-pointer items-baseline gap-2.5 border-b border-dashed border-rule-faint px-0.5 py-3 text-left"
                >
                  <div className="min-w-[150px]">
                    <div className="text-[14.5px] font-bold text-ink">{periodLabel}</div>
                    <div className="text-[11.5px] text-ink-faint">
                      {Math.round(cycle.workedHours ?? 0)}h realizadas de {Math.round(cycle.predictedHours ?? 0)}h
                    </div>
                  </div>
                  <span className="leader" />
                  <div className="text-right">
                    <div className="text-[15px] font-bold text-ink">{formatCurrencyBRL(cycle.receivedValue ?? 0)}</div>
                    <div className={`text-[11.5px] ${positive ? "text-blue" : "text-red"}`}>
                      {positive ? "+" : ""}
                      {formatCurrencyBRL(diff)} vs previsto
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
