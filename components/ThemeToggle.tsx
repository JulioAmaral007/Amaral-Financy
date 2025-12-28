"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg",
        "bg-secondary text-secondary-foreground",
        "hover:bg-secondary/80 transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      {/* Sun Icon */}
      <Sun
        className={cn(
          "h-5 w-5 transition-all duration-300",
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0 absolute"
        )}
      />
      {/* Moon Icon */}
      <Moon
        className={cn(
          "h-5 w-5 transition-all duration-300",
          theme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0 absolute"
        )}
      />
    </button>
  );
}
