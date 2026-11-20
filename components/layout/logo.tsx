import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/** Marca do Rumo: as três fatias da divisão empilhadas, nas cores de cada pessoa. */
export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={cn("h-7 w-7", className)}>
      <rect x="0" y="2" width="28" height="7" rx="3.5" fill="var(--pai)" />
      <rect x="0" y="11" width="18" height="7" rx="3.5" fill="var(--thais)" />
      <rect x="0" y="20" width="23" height="7" rx="3.5" fill="var(--julio)" />
    </svg>
  );
}
