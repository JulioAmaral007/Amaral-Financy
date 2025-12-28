import {
  Wallet,
  Utensils,
  Car,
  ShoppingCart,
  TrendingUp,
  Gamepad2,
  Heart,
  Home,
  type LucideIcon,
} from "lucide-react";

export type CategoryColor = "green" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: CategoryColor;
  itemCount: number;
}

export interface Transaction {
  id: string;
  description: string;
  date: string;
  category: Category;
  type: "income" | "expense";
  amount: number;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Alimentação",
    description: "Restaurantes, delivery e refeições",
    icon: Utensils,
    color: "yellow",
    itemCount: 12,
  },
  {
    id: "2",
    name: "Entretenimento",
    description: "Cinema, jogos e lazer",
    icon: Gamepad2,
    color: "pink",
    itemCount: 2,
  },
  {
    id: "3",
    name: "Investimento",
    description: "Aplicações e retornos financeiros",
    icon: TrendingUp,
    color: "green",
    itemCount: 1,
  },
  {
    id: "4",
    name: "Mercado",
    description: "Compras de supermercado e mantimentos",
    icon: ShoppingCart,
    color: "yellow",
    itemCount: 3,
  },
  {
    id: "5",
    name: "Salário",
    description: "Renda mensal e bonificações",
    icon: Wallet,
    color: "green",
    itemCount: 3,
  },
  {
    id: "6",
    name: "Saúde",
    description: "Medicamentos, consultas e exames",
    icon: Heart,
    color: "pink",
    itemCount: 0,
  },
  {
    id: "7",
    name: "Transporte",
    description: "Gasolina, transporte público e viagens",
    icon: Car,
    color: "blue",
    itemCount: 8,
  },
  {
    id: "8",
    name: "Utilidades",
    description: "Energia, água, internet e telefone",
    icon: Home,
    color: "yellow",
    itemCount: 7,
  },
];

export const transactions: Transaction[] = [
  {
    id: "1",
    description: "Pagamento de Salário",
    date: "01/12/25",
    category: categories[4],
    type: "income",
    amount: 4250.0,
  },
  {
    id: "2",
    description: "Jantar no Restaurante",
    date: "30/11/25",
    category: categories[0],
    type: "expense",
    amount: 89.5,
  },
  {
    id: "3",
    description: "Posto de Gasolina",
    date: "29/11/25",
    category: categories[6],
    type: "expense",
    amount: 100.0,
  },
  {
    id: "4",
    description: "Compras no Mercado",
    date: "28/11/25",
    category: categories[3],
    type: "expense",
    amount: 156.8,
  },
  {
    id: "5",
    description: "Retorno de Investimento",
    date: "26/11/25",
    category: categories[2],
    type: "income",
    amount: 340.25,
  },
  {
    id: "6",
    description: "Aluguel",
    date: "26/11/25",
    category: categories[7],
    type: "expense",
    amount: 1700.0,
  },
  {
    id: "7",
    description: "Freelance",
    date: "24/11/25",
    category: categories[4],
    type: "income",
    amount: 2500.0,
  },
  {
    id: "8",
    description: "Compras Jantar",
    date: "22/11/25",
    category: categories[3],
    type: "expense",
    amount: 150.0,
  },
  {
    id: "9",
    description: "Cinema",
    date: "18/12/25",
    category: categories[1],
    type: "expense",
    amount: 88.0,
  },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getTotalBalance(): number {
  return transactions.reduce((acc, t) => {
    return t.type === "income" ? acc + t.amount : acc - t.amount;
  }, 12847.32);
}

export function getMonthlyIncome(): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
}

export function getMonthlyExpenses(): number {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
}

export function getCategoryTotals(): { category: Category; total: number }[] {
  const totals = new Map<string, number>();

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const current = totals.get(t.category.id) || 0;
      totals.set(t.category.id, current + t.amount);
    });

  return categories
    .filter((c) => totals.has(c.id))
    .map((c) => ({
      category: c,
      total: totals.get(c.id) || 0,
    }))
    .sort((a, b) => b.total - a.total);
}
