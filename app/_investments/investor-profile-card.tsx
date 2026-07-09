"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateInvestmentSettingsAction } from "@/actions/investment.actions";
import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { cn } from "@/lib/utils";
import { investorProfiles } from "@/schemas/investment.schema";
import { INVESTOR_PROFILE_META } from "@/services/investment-math.service";
import type { ProfileTargetRow } from "@/services/investment-view.service";
import type { InvestmentSettings, InvestorProfile } from "@/types/investment";

interface InvestorProfileCardProps {
  settings: InvestmentSettings;
  description: string;
  targets: ProfileTargetRow[];
}

export function InvestorProfileCard({ settings, description, targets }: InvestorProfileCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function selectProfile(investorProfile: InvestorProfile) {
    if (investorProfile === settings.investorProfile) return;

    startTransition(async () => {
      const result = await updateInvestmentSettingsAction({
        investorProfile,
        reserveMonthlyCost: settings.reserveMonthlyCost,
        reserveTargetMonths: settings.reserveTargetMonths,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="rotate-[0.25deg]">
      <ReceiptTitle className="text-[18px] tracking-[0.08em] sm:text-[20px]">PERFIL DE INVESTIDOR</ReceiptTitle>
      <StarDivider className="mb-4 mt-2" />

      <div className="mb-3.5 flex gap-2">
        {investorProfiles.map((profile) => {
          const active = profile === settings.investorProfile;
          return (
            <button
              key={profile}
              type="button"
              onClick={() => selectProfile(profile)}
              disabled={isPending}
              aria-pressed={active}
              className={cn(
                "flex-1 cursor-pointer border-2 px-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-60 sm:text-[11.5px] sm:tracking-[0.12em]",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-transparent text-ink-soft hover:text-ink"
              )}
            >
              {INVESTOR_PROFILE_META[profile].shortLabel}
            </button>
          );
        })}
      </div>

      <p className="mb-3.5 min-h-[56px] text-[12.5px] leading-[1.55] text-ink-soft">{description}</p>

      <div className="border-t-2 border-dashed border-rule-faint pt-3">
        <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">Alocação-alvo</div>
        <div className="flex flex-col gap-1.5">
          {targets.map((target) => (
            <div key={target.assetClass} className="flex items-center gap-2 text-[12.5px]">
              <span aria-hidden className="inline-block h-2.5 w-2.5 flex-none" style={{ background: target.color }} />
              <span className="text-ink">{target.label}</span>
              <span aria-hidden className="leader" />
              <span className="font-bold text-ink">{target.pctLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
