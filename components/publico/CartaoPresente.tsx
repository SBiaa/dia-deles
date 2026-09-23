"use client";

import { useState } from "react";
import { formatarPreco } from "@/lib/formatar";
import type { PresenteComReserva } from "@/lib/db/queries/presentes";

export function CartaoPresente({ presente }: { presente: PresenteComReserva }) {
  const [reservado, setReservado] = useState(!!presente.reserva);
  const [aberto, setAberto] = useState(false);
  const [estado, setEstado] = useState<"idle" | "enviando" | "erro">("idle");
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setErro(null);

    const formData = new FormData(event.currentTarget);
    const resposta = await fetch(`/api/presentes/${presente.id}/reservar`, {
      method: "POST",
      body: formData,
    });

    if (resposta.ok) {
      setReservado(true);
      setAberto(false);
      setEstado("idle");
      return;
    }

    const corpo = await resposta.json().catch(() => null);
    setErro(corpo?.erro ?? "Não foi possível reservar. Tente novamente.");
    setEstado("erro");
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <p className="font-serif text-lg text-foreground">{presente.nome}</p>
      {presente.descricao && (
        <p className="mt-1 text-sm text-muted-foreground">
          {presente.descricao}
        </p>
      )}
      {presente.preco_centavos !== null && (
        <p className="mt-2 text-sm text-accent">
          {formatarPreco(presente.preco_centavos)}
        </p>
      )}

      <div className="mt-4">
        {reservado ? (
          <p className="text-sm text-muted-foreground">
            Já foi presenteado, obrigado!
          </p>
        ) : aberto ? (
          <form onSubmit={enviar} className="flex flex-col gap-2">
            <input
              type="text"
              name="site"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <input
              name="nomeConvidado"
              required
              placeholder="Seu nome"
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
            />
            {erro && <p className="text-xs text-accent">{erro}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={estado === "enviando"}
                className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
              >
                {estado === "enviando" ? "Enviando..." : "Confirmar"}
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="text-xs text-muted-foreground underline"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="text-sm text-accent underline"
          >
            Vou presentear
          </button>
        )}
      </div>
    </div>
  );
}
