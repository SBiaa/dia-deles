"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { gerarRoteiroSugerido } from "@/app/painel/cronograma/actions";

export function BotaoRoteiroSugerido({
  rotulo = "Gerar roteiro sugerido",
  destaque = false,
}: {
  rotulo?: string;
  destaque?: boolean;
}) {
  const [estado, action, pendente] = useActionState(
    gerarRoteiroSugerido,
    undefined
  );

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={pendente}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
          destaque
            ? "bg-accent text-accent-foreground hover:opacity-90"
            : "border border-border bg-card text-foreground/80 hover:border-accent/40 hover:text-accent"
        }`}
      >
        <Sparkles size={16} aria-hidden />
        {pendente ? "Gerando..." : rotulo}
      </button>
      {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
      {typeof estado?.adicionados === "number" && (
        <p className="text-sm text-verde">
          {estado.adicionados > 0
            ? `${estado.adicionados} atividades adicionadas.`
            : "Esse roteiro já estava na sua lista."}
        </p>
      )}
    </form>
  );
}
