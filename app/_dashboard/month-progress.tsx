"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ProgressStep {
  /** O que falta fazer, no infinitivo ("registrar a divisão"). */
  todo: string;
  done: boolean;
}

interface MonthProgressProps {
  steps: ProgressStep[];
}

const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CONFETTI_COLORS = ["var(--pai)", "var(--thais)", "var(--julio)", "var(--ink)"];
const PARTICLES = Array.from({ length: 28 }, (_, index) => {
  // Pseudoaleatório determinístico: o mesmo desenho a cada render.
  const angle = (index / 28) * Math.PI * 2 + Math.sin(index * 12.9898) * 0.4;
  const distance = 60 + ((index * 37) % 50);
  return {
    dx: `${Math.cos(angle) * distance}px`,
    dy: `${Math.sin(angle) * distance + 30}px`,
    rot: `${(index * 97) % 360}deg`,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    wide: index % 3 === 0,
  };
});

/**
 * Fechamento do mês: um anel que enche conforme as etapas são concluídas e
 * diz qual é a próxima. Ao completar (durante o uso), solta um confete curto.
 */
export function MonthProgress({ steps }: MonthProgressProps) {
  const doneCount = steps.filter((step) => step.done).length;
  const complete = doneCount === steps.length;
  const next = steps.find((step) => !step.done);

  // Só comemora a transição feita agora, não ao abrir um mês já fechado.
  const [prevComplete, setPrevComplete] = useState(complete);
  const [celebrating, setCelebrating] = useState(false);
  if (complete !== prevComplete) {
    setPrevComplete(complete);
    setCelebrating(complete);
  }

  return (
    <div
      className="flex flex-none items-center gap-3"
      role="img"
      aria-label={`${complete ? "Mês fechado" : "Fechamento do mês"}: ${doneCount} de ${steps.length}.${next ? ` Falta ${next.todo}.` : ""}`}
      title={next ? `Falta ${next.todo}` : "Mês fechado"}
    >
      <div className="relative h-12 w-12 flex-none">
        <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="5" />
          <circle
            cx="24"
            cy="24"
            r={RADIUS}
            fill="none"
            stroke={complete ? "var(--good)" : "var(--ink)"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - doneCount / steps.length)}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {complete ? (
            <Check className="h-5 w-5 animate-pop text-good" strokeWidth={3} />
          ) : (
            <span className="font-display text-[14px] font-bold text-ink">
              {doneCount}/{steps.length}
            </span>
          )}
        </div>

        {celebrating && (
          <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
            {PARTICLES.map((particle, index) => (
              <span
                key={index}
                onAnimationEnd={index === 0 ? () => setCelebrating(false) : undefined}
                className={cn("absolute block rounded-[2px]", particle.wide ? "h-1.5 w-3" : "h-2 w-2")}
                style={
                  {
                    background: particle.color,
                    "--dx": particle.dx,
                    "--dy": particle.dy,
                    "--rot": particle.rot,
                    animation: "confetti-fall 1.1s cubic-bezier(0.2, 0.7, 0.3, 1) forwards",
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="hidden min-w-0 leading-tight sm:block" aria-hidden>
        <p className="text-[13.5px] font-semibold text-ink">{complete ? "Mês fechado" : "Fechamento do mês"}</p>
        <p className="text-[13px] text-muted">{next ? `Falta ${next.todo}` : "Tudo lançado e dividido"}</p>
      </div>
    </div>
  );
}
