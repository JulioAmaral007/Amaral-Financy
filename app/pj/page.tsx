import { redirect } from "next/navigation";

import { PjView } from "@/app/_pj/pj-view";
import * as authService from "@/services/auth.service";
import * as pjService from "@/services/pj.service";

export default async function PjPage() {
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [activeCycle, archivedCycles] = await Promise.all([
    pjService.getActiveCycleView(),
    pjService.listArchivedCyclesView(),
  ]);

  return <PjView activeCycle={activeCycle} archivedCycles={archivedCycles} />;
}
