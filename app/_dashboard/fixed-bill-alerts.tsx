import type { FixedBillView } from "@/services/fixed-bill.service";

interface FixedBillAlertsProps {
  alerts: FixedBillView[];
}

export function FixedBillAlerts({ alerts }: FixedBillAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-4 border-2 border-dashed border-red px-4 py-3">
      <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-red">
        !! Contas próximas do vencimento
      </div>
      {alerts.map((alert) => (
        <p key={alert.id} className="py-0.5 text-[13px] text-red">
          - {alert.alertText}
        </p>
      ))}
    </div>
  );
}
