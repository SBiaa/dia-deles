"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/Botao";

export function FormularioRsvp({ casamentoId }: { casamentoId: string }) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "erro">(
    "idle"
  );
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [vaiComparecer, setVaiComparecer] = useState(true);

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setMensagemErro(null);

    const formData = new FormData(event.currentTarget);
    const resposta = await fetch("/api/rsvp", {
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
        Obrigado por confirmar! Já registramos sua resposta.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="mx-auto flex max-w-md flex-col gap-4">
      <input type="hidden" name="casamentoId" value={casamentoId} />
      {/* honeypot */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nomeConvidado" className="text-sm text-muted-foreground">
          Seu nome
        </label>
        <input
          id="nomeConvidado"
          name="nomeConvidado"
          required
          className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

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

      {vaiComparecer && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="numeroAcompanhantes"
            className="text-sm text-muted-foreground"
          >
            Quantos acompanhantes (além de você)?
          </label>
          <input
            id="numeroAcompanhantes"
            name="numeroAcompanhantes"
            type="number"
            min={0}
            max={20}
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
