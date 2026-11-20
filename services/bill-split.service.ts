import { round2 } from "@/lib/utils";
import type { SalarySplitResult } from "@/types/bill-split";
import type { SplitMode } from "@/types/month";

/**
 * Salário 1 é prioritário e paga a conta até seu próprio limite. O restante
 * (quando salário 2 e 3 existem os dois) garante um piso de `MIN_PAYMENT_23`
 * para cada um; o que sobra acima do piso é proporcional ao salário de cada
 * um, sem nunca exceder o que cada um efetivamente tem. Se o restante não
 * for suficiente para garantir o piso aos dois, ele é dividido igualmente.
 * Quando só um dos dois participa (salário 0), ele paga o restante sozinho,
 * até seu limite. Se a soma dos salários não cobrir a conta, o valor não
 * coberto é reportado em `shortfall` (a conta não é rejeitada).
 */
const MIN_PAYMENT_23 = 500;

function emptySplit(): SalarySplitResult {
  return {
    salary1Payment: 0,
    salary2Payment: 0,
    salary3Payment: 0,
    totalDistributed: 0,
    exceeds: false,
    shortfall: 0,
  };
}

export function calculateSalarySplit(
  salary1: number,
  salary2: number,
  salary3: number,
  billAmount: number
): SalarySplitResult {
  if (billAmount <= 0) return emptySplit();

  const total = salary1 + salary2 + salary3;
  const exceeds = billAmount > total;
  const shortfall = exceeds ? round2(billAmount - total) : 0;

  const salary1Payment = round2(Math.min(billAmount, salary1));
  const remainder = Math.max(0, billAmount - salary1);
  const sum23 = salary2 + salary3;

  let salary2Payment = 0;
  let salary3Payment = 0;

  if (remainder > 0 && sum23 > 0) {
    if (remainder > sum23) {
      // Nem juntos, salário 2 e 3 cobrem o restante: cada um paga o que tem.
      salary2Payment = round2(salary2);
      salary3Payment = round2(salary3);
    } else if (salary2 === 0 || salary3 === 0) {
      // Só um dos dois participa: ele paga o restante inteiro.
      salary2Payment = round2(remainder * (salary2 / sum23));
      salary3Payment = round2(remainder - salary2Payment);
    } else if (remainder <= MIN_PAYMENT_23 * 2) {
      // Não dá pra garantir o piso pros dois: divide o restante igualmente.
      salary2Payment = round2(remainder / 2);
      salary3Payment = round2(remainder - salary2Payment);
    } else {
      // Cada um paga o piso; o excedente acima disso é proporcional ao
      // salário, sem nunca ultrapassar o que cada um efetivamente tem.
      const extra = remainder - MIN_PAYMENT_23 * 2;
      const cap2 = salary2 - MIN_PAYMENT_23;
      const cap3 = salary3 - MIN_PAYMENT_23;

      let extra2 = extra * (salary2 / sum23);
      let extra3 = extra - extra2;

      if (extra2 > cap2) {
        extra2 = cap2;
        extra3 = extra - extra2;
      } else if (extra3 > cap3) {
        extra3 = cap3;
        extra2 = extra - extra3;
      }

      salary2Payment = round2(MIN_PAYMENT_23 + extra2);
      salary3Payment = round2(MIN_PAYMENT_23 + extra3);
    }

    const roundingDiff = round2(remainder - (salary2Payment + salary3Payment));
    if (roundingDiff !== 0 && remainder <= sum23) {
      if (salary2 >= salary3) salary2Payment = round2(salary2Payment + roundingDiff);
      else salary3Payment = round2(salary3Payment + roundingDiff);
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

/**
 * Divisão como na planilha: o salário 1 (INSS + extra do pai) paga primeiro,
 * até o seu limite, e o saldo restante é dividido meio a meio entre os
 * salários 2 e 3, sem olhar quanto cada um ganha. Nunca há `shortfall`, já
 * que o saldo é sempre repartido por inteiro.
 */
export function calculateEqualSplit(salary1: number, billAmount: number): SalarySplitResult {
  if (billAmount <= 0) return emptySplit();

  const salary1Payment = round2(Math.min(billAmount, salary1));
  const remainder = round2(Math.max(0, billAmount - salary1));
  const salary2Payment = round2(remainder / 2);
  const salary3Payment = round2(remainder - salary2Payment);

  return {
    salary1Payment,
    salary2Payment,
    salary3Payment,
    totalDistributed: round2(salary1Payment + salary2Payment + salary3Payment),
    exceeds: false,
    shortfall: 0,
  };
}

/** Divisão do mês no modo escolhido (50/50 ou proporcional ao salário). */
export function calculateMonthSplit(
  mode: SplitMode,
  salaries: { salary1: number; salary2: number; salary3: number },
  billAmount: number
): SalarySplitResult {
  if (mode === "equal") return calculateEqualSplit(salaries.salary1, billAmount);
  return calculateSalarySplit(salaries.salary1, salaries.salary2, salaries.salary3, billAmount);
}
