import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountCard } from "@/app/_profile/account-card";
import { NotificationsCard } from "@/app/_profile/notifications-card";
import { PreferencesCard } from "@/app/_profile/preferences-card";
import { SecurityCard } from "@/app/_profile/security-card";
import { StatsRow } from "@/app/_profile/stats-row";
import { Card } from "@/components/ui/card";
import { ReceiptTitle } from "@/components/ui/receipt";
import * as accountService from "@/services/account.service";

export default async function ProfilePage() {
  const account = await accountService.getAccountProfile();
  if (!account) redirect("/login");

  return (
    <div>
      <Link
        href="/"
        className="mb-5 inline-block text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
      >
        &lt;- Voltar
      </Link>

      <Card className="rotate-[0.25deg]">
        <div className="mb-6 text-center">
          <ReceiptTitle className="text-[26px] tracking-[0.1em]">FICHA CADASTRAL</ReceiptTitle>
          <div className="mt-1 text-[12px] tracking-[0.18em] text-ink-soft">
            * * * * * * * * * * * * * * * * * * * *
          </div>
        </div>

        <div className="grid items-start gap-9 lg:grid-cols-[300px_1fr]">
          <div className="border-b-2 border-dashed border-rule-faint pb-6 lg:border-b-0 lg:border-r-2 lg:pb-0 lg:pr-9">
            <AccountCard account={account} />
          </div>

          <div className="flex flex-col gap-7">
            <StatsRow />
            <PreferencesCard initialCdiRate={account.cdiBaseRate} />
            <SecurityCard />
            <NotificationsCard initialPrefs={account.notifications} />
          </div>
        </div>
      </Card>
    </div>
  );
}
