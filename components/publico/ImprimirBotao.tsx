"use client";

import { Printer } from "lucide-react";

export function ImprimirBotao({ rotulo = "Imprimir ou salvar em PDF" }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground/80 transition hover:border-accent/40 hover:text-accent"
    >
      <Printer size={16} aria-hidden />
      {rotulo}
    </button>
  );
}
