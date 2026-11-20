"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const GAP = 6;
const VIEWPORT_MARGIN = 8;

interface PopoverProps {
  /** Campo que abre o painel: o painel se posiciona em relação a ele. */
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  /** Chamado com Esc ou clique fora. `restoreFocus` = devolver o foco ao campo. */
  onClose: (restoreFocus: boolean) => void;
  /** Painel pelo menos tão largo quanto o campo (listas). */
  matchWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Painel suspenso preso a um campo. Vai para o <body> (nada de ser cortado por
 * cartões), abre abaixo do campo ou acima quando falta espaço, e fica dentro da
 * tela no celular. A posição é escrita direto no estilo — sem re-render ao rolar.
 */
function Popover({ anchorRef, open, onClose, matchWidth, className, children }: PopoverProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const onCloseRef = React.useRef(onClose);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  });

  React.useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const anchor = anchorRef.current;
    if (!panel || !anchor) return;

    function place() {
      if (!panel || !anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;

      if (matchWidth) panel.style.minWidth = `${rect.width}px`;
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;

      const spaceBelow = viewportHeight - rect.bottom - GAP - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - GAP - VIEWPORT_MARGIN;
      const above = height > spaceBelow && spaceAbove > spaceBelow;

      const left = Math.min(
        Math.max(rect.left, VIEWPORT_MARGIN),
        Math.max(VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN)
      );
      const top = above ? rect.top - GAP - height : rect.bottom + GAP;

      panel.style.left = `${left}px`;
      panel.style.top = `${Math.max(VIEWPORT_MARGIN, top)}px`;
      panel.style.maxHeight = `${Math.max(160, above ? spaceAbove : spaceBelow)}px`;
      panel.style.transformOrigin = above ? "bottom left" : "top left";
      panel.style.setProperty("--popover-shift", above ? "4px" : "-4px");
      panel.style.visibility = "visible";
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchorRef, matchWidth]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current(true);
      }
    }
    function onPointer(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onCloseRef.current(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
      className={cn(
        "z-50 flex max-w-[calc(100vw-1rem)] animate-popover flex-col overflow-hidden rounded-[20px] bg-surface shadow-pop",
        className
      )}
    >
      {children}
    </div>,
    document.body
  );
}

export { Popover };
