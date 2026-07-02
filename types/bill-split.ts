export interface SalarySplitResult {
  salary1Payment: number;
  salary2Payment: number;
  salary3Payment: number;
  totalDistributed: number;
  exceeds: boolean;
  shortfall: number;
}

export interface MonthlyTotal {
  month: number;
  label: string;
  total: number;
}

export interface ChartPoint extends MonthlyTotal {
  x: number;
  y: number;
  isCurrent: boolean;
}

export interface PersonTotals {
  person1: number;
  person2: number;
  person3: number;
}
