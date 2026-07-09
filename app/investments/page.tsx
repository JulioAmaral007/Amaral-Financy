import { redirect } from "next/navigation";

import { InvestmentsView } from "@/app/_investments/investments-view";
import * as investmentService from "@/services/investment.service";

export default async function InvestmentsPage() {
  const data = await investmentService.getInvestmentsView();

  if (!data) {
    redirect("/login");
  }

  return <InvestmentsView data={data} />;
}
