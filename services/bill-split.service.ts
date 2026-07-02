import { round2 } from "@/lib/utils";
import type { FixedBill } from "@/types/fixed-bill";
import type { HistoryEntry } from "@/types/history";
import type { PersonTotals, SalarySplitResult } from "@/types/bill-split";

/**
 * Salário 1 é prioritário e paga a conta até seu próprio limite.
 * O restante é dividido proporcionalmente entre salário 2 e 3, cada um
 * pagando a mesma porcentagem do próprio salário, sem nunca exceder o que
 * cada um efetivamente tem. Se a soma dos salários não cobrir a conta,
 * o valor não coberto é reportado em `shortfall` (a conta não é rejeitada).
 */
export function calculateSalarySplit(
  salary1: number,
  salary2: number,
  salary3: number,
  billAmount: number
): SalarySplitResult {
  if (billAmount <= 0) {
    return {
      salary1Payment: 0,
      salary2Payment: 0,
      salary3Payment: 0,
      totalDistributed: 0,
      exceeds: false,
      shortfall: 0,
    };
  }

  const total = salary1 + salary2 + salary3;
  const exceeds = billAmount > total;
  const shortfall = exceeds ? round2(billAmount - total) : 0;

  const salary1Payment = round2(Math.min(billAmount, salary1));
  const remainder = Math.max(0, billAmount - salary1);
  const sum23 = salary2 + salary3;

  let salary2Payment = 0;
  let salary3Payment = 0;

  if (remainder > 0 && sum23 > 0) {
    if (remainder <= sum23) {
      salary2Payment = round2(remainder * (salary2 / sum23));
      salary3Payment = round2(remainder * (salary3 / sum23));

      const roundingDiff = round2(remainder - (salary2Payment + salary3Payment));
      if (roundingDiff !== 0) {
        if (salary2 >= salary3) salary2Payment = round2(salary2Payment + roundingDiff);
        else salary3Payment = round2(salary3Payment + roundingDiff);
      }
    } else {
      // Nem juntos, salário 2 e 3 cobrem o restante: cada um paga o que tem.
      salary2Payment = round2(salary2);
      salary3Payment = round2(salary3);
    }
  }

  return {
    salary1Payment,
    salary2Payment,
    salary3Payment,
    totalDistributed: round2(salary1Payment + salary2Payment + salary3Payment),
    exceeds,
    shortfall,
  };
}

export function filterHistoryForMonth(entries: HistoryEntry[], date: Date): HistoryEntry[] {
  return entries.filter((entry) => {
    const entryDate = new Date(entry.calculatedAt);
    return entryDate.getMonth() === date.getMonth() && entryDate.getFullYear() === date.getFullYear();
  });
}

export function getPersonTotalsForMonth(
  fixedBills: FixedBill[],
  historyForMonth: HistoryEntry[],
  salaries: { salary1: number; salary2: number; salary3: number }
): PersonTotals {
  let person1 = 0;
  let person2 = 0;
  let person3 = 0;

  for (const bill of fixedBills) {
    if (bill.payer === "salary1") person1 += bill.amount;
    else if (bill.payer === "salary2") person2 += bill.amount;
    else if (bill.payer === "salary3") person3 += bill.amount;
    else {
      const split = calculateSalarySplit(salaries.salary1, salaries.salary2, salaries.salary3, bill.amount);
      person1 += split.salary1Payment;
      person2 += split.salary2Payment;
      person3 += split.salary3Payment;
    }
  }

  for (const entry of historyForMonth) {
    person1 += entry.salary1Payment;
    person2 += entry.salary2Payment;
    person3 += entry.salary3Payment;
  }

  return { person1: round2(person1), person2: round2(person2), person3: round2(person3) };
}
