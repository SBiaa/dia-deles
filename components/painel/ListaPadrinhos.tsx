"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  Link2,
  MessageCircle,
  Trash2,
  UserRound,
} from "lucide-react";
import { removerPadrinho } from "@/app/painel/padrinhos/actions";
import { horarioCurto } from "@/lib/cronograma";
import { linkWhatsApp } from "@/lib/whatsapp";
import type { PadrinhoRow } from "@/lib/db/queries/padrinhos";

const botao =
  "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent";

function statusDe(p: PadrinhoRow) {
  if (p.aceitou === null) {
    return { texto: "Aguardando", classe: "bg-sol/15 text-[#8a6a1f]" };
  }
  return p.aceitou
    ? { texto: "Aceitou", classe: "bg-verde/10 text-verde" }
    : { texto: "Não poderá", classe: "bg-rosa/10 text-rosa" };
}

function Linha({
  padrinho,
  slug,
  mensagem,
}: {
  padrinho: PadrinhoRow;
  slug: string;
  mensagem: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const status = statusDe(padrinho);

  const url = () =>
    `${window.location.origin}/${slug}/padrinhos/${padrinho.token}`;

  async function copiar() {
    const link = url();
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link:", link);
    }
  }

  function abrirWhatsApp() {
    if (!padrinho.telefone) return;
    const texto = `Oi, ${padrinho.nome}! ${mensagem} Seu convite está aqui: ${url()}`;
    window.open(linkWhatsApp(padrinho.telefone, texto), "_blank");
  }

  return (
    <li className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sol-suave font-serif text-lg text-accent">
            {padrinho.nome.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium text-foreground">
                {padrinho.nome}
              </p>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground/70">
                {padrinho.papel}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.classe}`}
              >
                {status.texto}
              </span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
              {padrinho.horario_chegada && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} aria-hidden />
                  Chegada às {horarioCurto(padrinho.horario_chegada)}
                </span>
              )}
              {!padrinho.telefone && (
                <span className="inline-flex items-center gap-1">
                  <UserRound size={12} aria-hidden />
                  Sem WhatsApp cadastrado
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {padrinho.telefone && (
            <button type="button" onClick={abrirWhatsApp} className={botao}>
              <MessageCircle size={14} aria-hidden />
              Enviar convite
            </button>
          )}
          <button type="button" onClick={copiar} className={botao}>
            {copiado ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />}
            {copiado ? "Copiado!" : "Copiar link"}
          </button>
          <form
            action={removerPadrinho.bind(null, padrinho.id)}
            onSubmit={(e) => {
              if (!window.confirm(`Remover ${padrinho.nome}?`)) e.preventDefault();
            }}
          >
            <button
              type="submit"
              aria-label={`Remover ${padrinho.nome}`}
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
            >
              <Trash2 size={15} aria-hidden />
            </button>
          </form>
        </div>
      </div>

      {padrinho.resposta_mensagem && (
        <p className="rounded-xl bg-sol-suave px-4 py-3 text-sm italic text-foreground/80">
          “{padrinho.resposta_mensagem}”
        </p>
      )}
    </li>
  );
}

export function ListaPadrinhos({
  padrinhos,
  slug,
  mensagem,
}: {
  padrinhos: PadrinhoRow[];
  slug: string;
  mensagem: string;
}) {
  if (padrinhos.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
          <UserRound size={26} aria-hidden />
        </span>
        <h2 className="mt-5 font-serif text-2xl text-foreground">
          Quem vai estar ao lado de vocês?
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Adicione padrinhos, madrinhas e cortejo. Cada um recebe um convite
          pessoal e acesso ao manual.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
      {padrinhos.map((p) => (
        <Linha key={p.id} padrinho={p} slug={slug} mensagem={mensagem} />
      ))}
    </ul>
  );
}
