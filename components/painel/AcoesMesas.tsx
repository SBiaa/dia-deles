"use client";

import { useTransition } from "react";
import { Eraser, Wand2 } from "lucide-react";
import {
  distribuirAutomaticamente,
  limparMesas,
} from "@/app/painel/mesas/actions";

export function AcoesMesas({
  podeDistribuir,
  temAtribuidos,
}: {
  podeDistribuir: boolean;
  temAtribuidos: boolean;
}) {
  const [pendente, iniciar] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pendente || !podeDistribuir}
        onClick={() => iniciar(() => distribuirAutomaticamente())}
        className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        <Wand2 size={16} aria-hidden />
        {pendente ? "Distribuindo..." : "Distribuir automaticamente"}
      </button>
      {temAtribuidos && (
        <button
          type="button"
          disabled={pendente}
          onClick={() => {
            if (
              window.confirm(
                "Tirar todos os convidados das mesas? As mesas continuam criadas."
              )
            ) {
              iniciar(() => limparMesas());
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:border-rosa/40 hover:text-rosa disabled:opacity-50"
        >
          <Eraser size={16} aria-hidden />
          Limpar mesas
        </button>
      )}
    </div>
  );
}
