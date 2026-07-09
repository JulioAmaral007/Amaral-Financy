import { redirect } from "next/navigation";

import { GoalsView } from "@/app/_goals/goals-view";
import * as goalService from "@/services/goal.service";

export default async function GoalsPage() {
  const data = await goalService.getGoalsView();

  if (!data) {
    redirect("/login");
  }

  return <GoalsView goals={data.goals} cdiBaseRate={data.cdiBaseRate} />;
}
