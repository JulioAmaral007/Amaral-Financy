/**
 * Módulo de Cálculo Proporcional de Salários
 * 
 * Este módulo implementa a lógica de divisão de pagamento de contas
 * baseada em múltiplos salários, seguindo as regras de negócio:
 * 
 * 1. O primeiro salário é sempre prioritário
 * 2. Do primeiro salário, abate-se 100% do valor da conta até o limite do próprio salário
 * 3. Se a conta exceder o primeiro salário, o restante é distribuído proporcionalmente
 *    entre o segundo e terceiro salários
 * 4. A divisão proporcional garante que todos paguem a mesma porcentagem do próprio salário
 */

/**
 * Interface que representa o resultado do cálculo de distribuição
 */
export interface SalaryPaymentResult {
  /** Valor que o primeiro salário deve pagar */
  salary1Payment: number;
  /** Valor que o segundo salário deve pagar */
  salary2Payment: number;
  /** Valor que o terceiro salário deve pagar */
  salary3Payment: number;
  /** Valor total distribuído (deve ser igual ao valor da conta) */
  totalDistributed: number;
  /** Indica se a distribuição foi bem-sucedida */
  success: boolean;
  /** Mensagem de erro, se houver */
  errorMessage?: string;
}

/**
 * Interface para os parâmetros de entrada do cálculo
 */
export interface SalaryPaymentInput {
  /** Valor do primeiro salário (prioritário) */
  salary1: number;
  /** Valor do segundo salário */
  salary2: number;
  /** Valor do terceiro salário (opcional, default: 0) */
  salary3?: number;
  /** Valor da conta a ser paga */
  billAmount: number;
}

/**
 * Valida os valores de entrada
 * 
 * @param input - Parâmetros de entrada para validação
 * @returns Resultado da validação com mensagem de erro se inválido
 */
function validateInput(input: SalaryPaymentInput): { valid: boolean; error?: string } {
  const { salary1, salary2, salary3 = 0, billAmount } = input;

  // Validar valores negativos
  if (salary1 < 0) {
    return { valid: false, error: "Salário 1 não pode ser negativo" };
  }
  if (salary2 < 0) {
    return { valid: false, error: "Salário 2 não pode ser negativo" };
  }
  if (salary3 < 0) {
    return { valid: false, error: "Salário 3 não pode ser negativo" };
  }
  if (billAmount < 0) {
    return { valid: false, error: "Valor da conta não pode ser negativo" };
  }

  // Verificar se a soma dos salários é suficiente para cobrir a conta
  const totalSalaries = salary1 + salary2 + salary3;
  if (billAmount > totalSalaries) {
    return { 
      valid: false, 
      error: `A soma dos salários (${totalSalaries.toFixed(2)}) é insuficiente para cobrir a conta (${billAmount.toFixed(2)})` 
    };
  }

  return { valid: true };
}

/**
 * Calcula a distribuição de uma conta entre até 3 salários
 * 
 * A lógica segue as seguintes regras:
 * 1. O primeiro salário é prioritário - paga 100% da conta até seu limite
 * 2. Se a conta exceder o salário 1, o restante é distribuído proporcionalmente
 *    entre os salários 2 e 3
 * 3. A divisão proporcional garante que salários 2 e 3 paguem a mesma % do próprio salário
 * 
 * @param input - Parâmetros contendo os salários e o valor da conta
 * @returns Resultado estruturado com os valores que cada salário deve pagar
 * 
 * @example
 * // Conta menor que salário 1 - salário 1 paga tudo
 * const result = calculateSalaryPayment({
 *   salary1: 3000,
 *   salary2: 2000,
 *   billAmount: 2500
 * });
 * // Resultado: { salary1Payment: 2500, salary2Payment: 0, salary3Payment: 0, ... }
 * 
 * @example
 * // Conta maior que salário 1 - excedente dividido proporcionalmente
 * const result = calculateSalaryPayment({
 *   salary1: 2000,
 *   salary2: 1000,
 *   salary3: 500,
 *   billAmount: 2750
 * });
 * // Salário 1 paga seus 2000 inteiros
 * // Restante (750) dividido entre sal2 e sal3 proporcionalmente
 * // sal2 (1000) paga 500 (50% do salário)
 * // sal3 (500) paga 250 (50% do salário)
 */
export function calculateSalaryPayment(input: SalaryPaymentInput): SalaryPaymentResult {
  const { salary1, salary2, salary3 = 0, billAmount } = input;

  // Criar resultado de erro padrão
  const createErrorResult = (errorMessage: string): SalaryPaymentResult => ({
    salary1Payment: 0,
    salary2Payment: 0,
    salary3Payment: 0,
    totalDistributed: 0,
    success: false,
    errorMessage,
  });

  // Validar entrada
  const validation = validateInput(input);
  if (!validation.valid) {
    return createErrorResult(validation.error!);
  }

  // Caso especial: conta com valor zero
  if (billAmount === 0) {
    return {
      salary1Payment: 0,
      salary2Payment: 0,
      salary3Payment: 0,
      totalDistributed: 0,
      success: true,
    };
  }

  // Caso especial: não há salários
  const totalSalaries = salary1 + salary2 + salary3;
  if (totalSalaries === 0) {
    return createErrorResult("Não há salários disponíveis para cobrir a conta");
  }

  // REGRA PRINCIPAL: Salário 1 é prioritário
  // Ele paga até 100% do seu valor primeiro
  let salary1Payment = 0;
  let salary2Payment = 0;
  let salary3Payment = 0;
  let remainingBill = billAmount;

  // Passo 1: Salário 1 paga o máximo que pode (até seu valor total)
  if (remainingBill <= salary1) {
    // A conta é menor ou igual ao salário 1, ele paga tudo
    salary1Payment = remainingBill;
    remainingBill = 0;
  } else {
    // A conta excede o salário 1, ele paga tudo que tem
    salary1Payment = salary1;
    remainingBill = billAmount - salary1;
  }

  // Passo 2: Se ainda houver valor restante, divide proporcionalmente entre sal2 e sal3
  if (remainingBill > 0) {
    const totalRemainingSalaries = salary2 + salary3;
    
    if (totalRemainingSalaries === 0) {
      return createErrorResult("Os salários 2 e 3 são insuficientes para cobrir o restante da conta");
    }

    if (remainingBill > totalRemainingSalaries) {
      return createErrorResult(
        `A soma dos salários (${totalSalaries.toFixed(2)}) é insuficiente para cobrir a conta (${billAmount.toFixed(2)})`
      );
    }

    // Distribuição proporcional entre sal2 e sal3
    // Cada um paga a mesma porcentagem do próprio salário
    const proportionFactor = remainingBill / totalRemainingSalaries;
    
    salary2Payment = salary2 * proportionFactor;
    salary3Payment = salary3 * proportionFactor;

    // Arredondar para 2 casas decimais
    salary2Payment = Math.round(salary2Payment * 100) / 100;
    salary3Payment = Math.round(salary3Payment * 100) / 100;

    // Ajustar arredondamento para garantir precisão
    const currentRemaining = salary2Payment + salary3Payment;
    const difference = Math.round((remainingBill - currentRemaining) * 100) / 100;
    
    if (difference !== 0) {
      if (salary2 >= salary3) {
        salary2Payment += difference;
      } else {
        salary3Payment += difference;
      }
    }
  }

  // Arredondar pagamento do salário 1 também
  salary1Payment = Math.round(salary1Payment * 100) / 100;

  return {
    salary1Payment,
    salary2Payment,
    salary3Payment,
    totalDistributed: Math.round((salary1Payment + salary2Payment + salary3Payment) * 100) / 100,
    success: true,
  };
}

/**
 * Versão simplificada que retorna apenas um array com os valores de pagamento
 * 
 * @param salary1 - Valor do primeiro salário
 * @param salary2 - Valor do segundo salário
 * @param salary3 - Valor do terceiro salário (opcional)
 * @param billAmount - Valor da conta a ser paga
 * @returns Array com [pagamento1, pagamento2, pagamento3] ou null em caso de erro
 */
export function calculateSalaryPaymentSimple(
  salary1: number,
  salary2: number,
  salary3: number = 0,
  billAmount: number
): [number, number, number] | null {
  const result = calculateSalaryPayment({ salary1, salary2, salary3, billAmount });
  
  if (!result.success) {
    return null;
  }
  
  return [result.salary1Payment, result.salary2Payment, result.salary3Payment];
}

/**
 * Calcula a porcentagem que cada salário está contribuindo em relação ao seu valor total
 * 
 * @param input - Parâmetros contendo os salários e o valor da conta
 * @returns Objeto com as porcentagens de contribuição de cada salário, ou null em caso de erro
 */
export function calculateContributionPercentages(input: SalaryPaymentInput): {
  salary1Percentage: number;
  salary2Percentage: number;
  salary3Percentage: number;
} | null {
  const result = calculateSalaryPayment(input);
  
  if (!result.success) {
    return null;
  }

  const { salary1, salary2, salary3 = 0 } = input;

  return {
    salary1Percentage: salary1 > 0 ? (result.salary1Payment / salary1) * 100 : 0,
    salary2Percentage: salary2 > 0 ? (result.salary2Payment / salary2) * 100 : 0,
    salary3Percentage: salary3 > 0 ? (result.salary3Payment / salary3) * 100 : 0,
  };
}
