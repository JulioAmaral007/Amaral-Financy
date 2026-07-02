import type { FixedBillView } from "@/services/fixed-bill.service";

interface FixedBillAlertsProps {
  alerts: FixedBillView[];
}

export function FixedBillAlerts({ alerts }: FixedBillAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-5 flex flex-col gap-2 rounded-xl bg-amber/16 px-5 py-4">
      <div className="flex items-center gap-2 text-[13px] font-bold text-amber-soft">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-amber/25 text-[11px]">
          !
        </span>
        Contas próximas do vencimento
      </div>
      {alerts.map((alert) => (
        <p key={alert.id} className="pl-[26px] text-[13px] text-foreground/80">
          {alert.alertText}
        </p>
      ))}
    </div>
  );
}
