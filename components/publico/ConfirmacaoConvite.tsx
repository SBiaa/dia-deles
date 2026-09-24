"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";
import type { ConvidadoRow } from "@/lib/db/queries/convidados";

export function ConfirmacaoConvite({ convidado }: { convidado: ConvidadoRow }) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "erro">(
    convidado.confirmado !== null ? "ok" : "idle"
  );
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [vaiComparecer, setVaiComparecer] = useState(
    convidado.confirmado !== false
  );

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setMensagemErro(null);

    const formData = new FormData(event.currentTarget);
    const resposta = await fetch(`/api/convite/${convidado.codigo}/responder`, {
      method: "POST",
      body: formData,
    });

    if (resposta.ok) {
      setEstado("ok");
      return;
    }

    const corpo = await resposta.json().catch(() => null);
    setMensagemErro(corpo?.erro ?? "Não foi possível enviar. Tente novamente.");
    setEstado("erro");
  }

  if (estado === "ok") {
    return (
      <p className="text-center text-foreground">
        Obrigado por confirmar, {convidado.nome}! Já registramos sua
        resposta.{" "}
        <button
          type="button"
          onClick={() => setEstado("idle")}
          className="text-accent underline"
        >
          Mudar resposta
        </button>
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="confirmado"
            value="sim"
            checked={vaiComparecer}
            onChange={() => setVaiComparecer(true)}
          />
          Vou comparecer
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="confirmado"
            value="nao"
            checked={!vaiComparecer}
            onChange={() => setVaiComparecer(false)}
          />
          Não vou conseguir ir
        </label>
      </div>

      {vaiComparecer && convidado.limite_acompanhantes > 0 && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="numeroAcompanhantes"
            className="text-sm text-muted-foreground"
          >
            Quantos acompanhantes (além de você, até{" "}
            {convidado.limite_acompanhantes})?
          </label>
          <input
            id="numeroAcompanhantes"
            name="numeroAcompanhantes"
            type="number"
            min={0}
            max={convidado.limite_acompanhantes}
            defaultValue={0}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mensagem" className="text-sm text-muted-foreground">
          Mensagem (opcional)
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={3}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {mensagemErro && <p className="text-sm text-accent">{mensagemErro}</p>}

      <Botao type="submit" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Enviando..." : "Confirmar presença"}
      </Botao>
    </form>
  );
}
