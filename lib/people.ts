/**
 * Nomes exibidos para cada "salário" do sistema. Os identificadores internos
 * (salary1/2/3) continuam genéricos; aqui está o único lugar que dá nome a eles.
 *
 * - salary1: INSS + Extra Pai — paga primeiro, até o seu limite.
 * - salary2 / salary3: quem divide o saldo restante.
 */
export const PERSON_LABELS = {
  salary1: "Pai",
  salary2: "Thais",
  salary3: "Julio",
} as const;

export const SALARY1_FULL_LABEL = "INSS + Extra Pai";
