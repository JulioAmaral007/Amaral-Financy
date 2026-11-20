export interface HistoryEntry {
  id: string;
  billAmount: number;
  salary1Payment: number;
  salary2Payment: number;
  salary3Payment: number;
  calculatedAt: string;
  /** Mês da divisão registrada ("YYYY-MM"); pode diferir do mês de `calculatedAt`. */
  month: string;
}
