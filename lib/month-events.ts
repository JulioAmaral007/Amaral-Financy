const MONTH_DATA_UPDATED_EVENT = "financy:month-data-updated";

/** Avisa que gastos avulsos ou ajustes do mês (INSS, estimativas…) mudaram. */
export function emitMonthDataUpdated(): void {
  window.dispatchEvent(new Event(MONTH_DATA_UPDATED_EVENT));
}

export function onMonthDataUpdated(callback: () => void): () => void {
  window.addEventListener(MONTH_DATA_UPDATED_EVENT, callback);
  return () => window.removeEventListener(MONTH_DATA_UPDATED_EVENT, callback);
}
