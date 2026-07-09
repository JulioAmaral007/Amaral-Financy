/**
 * As datas de ciclo/dia do PJ e o mês dos snapshots de investimento são colunas
 * `date` do Postgres (sem timezone). `new Date(isoString)` interpreta isso como
 * meia-noite UTC, o que pode deslocar o dia do calendário dependendo do fuso
 * local — sempre use estas funções para strings apenas-data.
 */
export function parseISODateLocal(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toISODateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Meses inteiros decorridos de `a` até `b`, só contando o mês depois de passado o dia. */
export function monthsBetween(a: Date, b: Date): number {
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  return months;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/** Primeiro dia do mês de `date`, como ISO date (`YYYY-MM-01`). */
export function startOfMonthISO(date: Date): string {
  return toISODateLocal(new Date(date.getFullYear(), date.getMonth(), 1));
}

const MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** `"2026-07-01"` → `"jul"`. */
export function monthShortLabel(isoDate: string): string {
  return MONTH_LABELS[parseISODateLocal(isoDate).getMonth()];
}

/** `"2026-07-01"` → `"jul/26"`. */
export function monthYearLabel(isoDate: string): string {
  const date = parseISODateLocal(isoDate);
  return `${MONTH_LABELS[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;
}
