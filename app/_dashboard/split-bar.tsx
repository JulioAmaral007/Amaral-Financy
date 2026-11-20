import { cn, formatCurrencyBRL } from "@/lib/utils";

import { PERSON_COLORS, type PersonKey } from "./people-colors";

export interface SplitSegment {
  key: PersonKey;
  label: string;
  value: number;
}

interface SplitBarProps {
  segments: SplitSegment[];
  /** Parte do total que os salários não cobrem (só no modo proporcional). */
  shortfall: number;
  className?: string;
}

/** Abaixo disso o nome não cabe dentro da fatia; o valor continua nos cartões. */
const MIN_LABEL_PCT = 9;

/**
 * A assinatura do Rumo: o total do mês como uma barra única, fatiada por quem
 * paga. As larguras animam enquanto os valores são digitados.
 */
export function SplitBar({ segments, shortfall, className }: SplitBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) + shortfall;

  if (total <= 0) {
    return (
      <div
        className={cn(
          "flex h-12 items-center justify-center rounded-full border-2 border-dashed border-ink/15 px-4 text-center text-[13.5px] text-muted sm:h-14",
          className
        )}
      >
        Lance contas ou gastos e a divisão aparece aqui.
      </div>
    );
  }

  const description = segments
    .map((segment) => `${segment.label} ${formatCurrencyBRL(segment.value)}`)
    .join(", ");

  return (
    <div
      role="img"
      aria-label={`Divisão do mês: ${description}${shortfall > 0 ? `, faltam ${formatCurrencyBRL(shortfall)}` : ""}`}
      className={cn("flex h-12 gap-[3px] overflow-hidden rounded-full sm:h-14", className)}
    >
      {segments.map((segment) => {
        const pct = (segment.value / total) * 100;
        return (
          <div
            key={segment.key}
            className={cn(
              "flex min-w-0 items-center justify-center overflow-hidden px-1.5 transition-[width] sm:justify-start duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:px-5",
              PERSON_COLORS[segment.key].segment,
              pct === 0 && "hidden"
            )}
            style={{ width: `${pct}%` }}
          >
            {pct >= MIN_LABEL_PCT && (
              <span className="whitespace-nowrap text-[12.5px] font-semibold sm:text-[14.5px]">
                {/* No celular a fatia é estreita: só o percentual; o nome está nos cartões abaixo. */}
                <span className={pct >= 30 ? "" : "hidden sm:inline"}>{segment.label} </span>
                <span className="opacity-70">{Math.round(pct)}%</span>
              </span>
            )}
          </div>
        );
      })}
      {shortfall > 0 && (
        <div
          className="hatch-bad flex min-w-0 items-center justify-center px-1.5 text-[12.5px] sm:px-4 sm:text-[13px] font-semibold text-white transition-[width] duration-700"
          style={{ width: `${(shortfall / total) * 100}%` }}
        >
          <span className="truncate">falta</span>
        </div>
      )}
    </div>
  );
}
