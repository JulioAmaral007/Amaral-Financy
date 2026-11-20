import type { MonthKey } from "@/types/month";

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const MONTH_SHORT_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

export function isMonthKey(value: string): boolean {
  return MONTH_KEY_PATTERN.test(value);
}

export function makeMonthKey(year: number, monthIndex: number): MonthKey {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function toMonthKey(date: Date): MonthKey {
  return makeMonthKey(date.getFullYear(), date.getMonth());
}

export function currentMonthKey(): MonthKey {
  return toMonthKey(new Date());
}

/** Mês ("YYYY-MM") de uma data "YYYY-MM-DD". */
export function monthKeyFromDate(date: string): MonthKey {
  return date.slice(0, 7);
}

export function parseMonthKey(key: MonthKey): { year: number; monthIndex: number } {
  const [year, month] = key.split("-").map(Number);
  return { year, monthIndex: month - 1 };
}

export function shiftMonth(key: MonthKey, delta: number): MonthKey {
  const { year, monthIndex } = parseMonthKey(key);
  const total = year * 12 + monthIndex + delta;
  return makeMonthKey(Math.floor(total / 12), ((total % 12) + 12) % 12);
}

/** Ex.: "Novembro 2026". */
export function monthLabel(key: MonthKey): string {
  const { year, monthIndex } = parseMonthKey(key);
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Data padrão ao lançar um gasto: hoje (se o mês exibido é o atual) ou o dia 1º do mês. */
export function defaultDateForMonth(key: MonthKey): string {
  return key === currentMonthKey() ? toDateInputValue(new Date()) : `${key}-01`;
}

/** Dia/mês curto de uma data "YYYY-MM-DD" (ex.: "03/11"). */
export function formatShortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

/** Primeiro e último dia do mês ("YYYY-MM-DD"), para limitar o campo de data. */
export function monthDateBounds(key: MonthKey): { min: string; max: string } {
  const { year, monthIndex } = parseMonthKey(key);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return { min: `${key}-01`, max: `${key}-${String(lastDay).padStart(2, "0")}` };
}
