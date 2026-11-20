"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CreditCard, History, ReceiptText } from "lucide-react";

import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "mes", label: "Mês", icon: CalendarDays },
  { id: "gastos", label: "Gastos", icon: CreditCard },
  { id: "contas", label: "Contas", icon: ReceiptText },
  { id: "divisoes", label: "Divisões", icon: History },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/**
 * Atalhos flutuantes no celular: a página é uma coluna longa, então cada
 * seção fica a um toque. Marca a seção visível e some no desktop, onde tudo
 * cabe em duas colunas. Seções que não existem no perfil (ex.: Divisões num
 * perfil sem divisão) não aparecem.
 */
export function SectionNav() {
  const [available, setAvailable] = useState<SectionId[]>([]);
  const [active, setActive] = useState<SectionId>("mes");

  useEffect(() => {
    const observed = new Set<Element>();
    const visibility = new Map<SectionId, number>();

    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visibility.set(entry.target.id as SectionId, entry.intersectionRatio);
        // A seção ativa é a que ocupa mais a faixa central da tela.
        let best: SectionId | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visibility) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] }
    );

    // As seções carregam dados antes de aparecer; reavalia quando o DOM muda.
    function scan() {
      const found: SectionId[] = [];
      for (const { id } of SECTIONS) {
        const element = document.getElementById(id);
        if (!element) continue;
        found.push(id);
        if (!observed.has(element)) {
          observed.add(element);
          intersection.observe(element);
        }
      }
      setAvailable((current) => (current.join() === found.join() ? current : found));
    }

    const mutation = new MutationObserver(scan);
    mutation.observe(document.body, { childList: true, subtree: true });
    const initial = window.setTimeout(scan, 0);

    return () => {
      window.clearTimeout(initial);
      mutation.disconnect();
      intersection.disconnect();
    };
  }, []);

  if (available.length < 2) return null;

  function goTo(id: SectionId) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Ir para a seção"
      className="fixed inset-x-0 bottom-3 z-20 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex gap-0.5 rounded-full bg-surface/90 p-1 shadow-pop backdrop-blur-md">
        {SECTIONS.filter(({ id }) => available.includes(id)).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => goTo(id)}
            aria-current={active === id ? "true" : undefined}
            className={cn(
              "flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors",
              active === id ? "bg-ink text-on-ink" : "text-muted hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
