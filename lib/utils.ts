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

export function formatCurrencyCompactBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
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

export function parseDecimalInput(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".")
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizeTimeDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4)
}

export function formatTimeDigits(digits: string): string {
  if (!digits) return ""
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

/** Converts raw HHMM digits to a clamped "HH:mm" value; null while incomplete. */
export function timeDigitsToValue(digits: string): string | null {
  if (digits.length !== 4) return null
  const hours = Math.min(23, Number(digits.slice(0, 2)))
  const minutes = Math.min(59, Number(digits.slice(2, 4)))
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

/** Decimal hours (e.g. 3.08) as a clock-style label (e.g. "3h05") for display only. */
export function formatHoursClock(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const wholeHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${wholeHours}h` : `${wholeHours}h${String(minutes).padStart(2, "0")}`
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}
