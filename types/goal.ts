export type GoalCategory =
  | "reserva"
  | "casa"
  | "carro"
  | "viagem"
  | "aposentadoria"
  | "computador"
  | "outro";

export type GoalPriority = "alta" | "media" | "baixa";

export type GoalRateMode = "cdi" | "fixed";

export interface Goal {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  initialContribution: number;
  monthlyContribution: number;
  startDate: string;
  rateMode: GoalRateMode;
  cdiPercent: number;
  fixedAnnualRate: number;
  priority: GoalPriority;
  createdAt: string;
  updatedAt: string;
}
