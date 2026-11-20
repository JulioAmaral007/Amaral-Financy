/**
 * Perfil: um conjunto separado de contas, gastos e históricos (ex.: "Casa",
 * "Pessoal"). Não confundir com `Profile`, que guarda os salários salvos.
 */
export interface Workspace {
  id: string;
  name: string;
  /** Quando ligado, o perfil mostra a "Divisão do mês" (INSS, Thais, Julio…). */
  splitEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
