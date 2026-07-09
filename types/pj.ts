export type PjJourneyMode = "h4" | "h8" | "custom";

export type PjWeekdayPreset = "segsex" | "segsab" | "custom";

export type PjCycleStatus = "active" | "archived";

export interface PjCycleConfig {
  startDate: string;
  endDate: string;
  hourlyRate: number;
  journeyMode: PjJourneyMode;
  journeyCustomHours: number | null;
  weekdayPreset: PjWeekdayPreset;
  customWeekdays: number[];
}

export interface PjCycle extends PjCycleConfig {
  id: string;
  status: PjCycleStatus;
  archivedAt: string | null;
  predictedHours: number | null;
  workedHours: number | null;
  predictedValue: number | null;
  receivedValue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PjCycleDay {
  id: string;
  cycleId: string;
  date: string;
  done: boolean;
  hoursWorked: number | null;
  note: string;
  morningStart: string | null;
  morningEnd: string | null;
  afternoonStart: string | null;
  afternoonEnd: string | null;
}
