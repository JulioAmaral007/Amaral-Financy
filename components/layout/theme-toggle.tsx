"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import {
  getThemePreference,
  onThemePreferenceChange,
  setThemePreference,
  type ThemePreference,
} from "@/lib/theme";

const OPTIONS: Record<ThemePreference, { icon: typeof Sun; label: string; next: ThemePreference }> = {
  system: { icon: Monitor, label: "automático", next: "light" },
  light: { icon: Sun, label: "claro", next: "dark" },
  dark: { icon: Moon, label: "escuro", next: "system" },
};

/** Um botão que alterna automático → claro → escuro. */
export function ThemeToggle() {
  const preference = useSyncExternalStore(onThemePreferenceChange, getThemePreference, () => "system" as const);
  const { icon: Icon, label, next } = OPTIONS[preference];

  return (
    <button
      type="button"
      onClick={() => setThemePreference(next)}
      aria-label={`Tema ${label}. Mudar para ${OPTIONS[next].label}`}
      title={`Tema: ${label}`}
      className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
