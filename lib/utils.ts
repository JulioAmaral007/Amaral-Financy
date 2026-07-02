import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function normalizeCurrencyDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+/, "")
}

export function parseCurrencyInput(value: string): number {
  const digits = normalizeCurrencyDigits(value)
  return digits ? Number(digits) / 100 : 0
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}
