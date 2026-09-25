"use client";

import { useState } from "react";
import {
  marcarConfirmadoManual,
  removerConvidado,
} from "@/app/painel/convidados/actions";
import type { ConvidadoRow } from "@/lib/db/queries/convidados";
import { linkWhatsApp } from "@/lib/whatsapp";

function status(convidado: ConvidadoRow): { texto: string; classe: string } {
  if (convidado.confirmado === null) {
    return { texto: "Pendente", classe: "bg-muted text-muted-foreground" };
  }
  if (convidado.confirmado) {
    return { texto: "Confirmou", classe: "bg-accent/10 text-accent" };
  }
  return { texto: "Não vai", classe: "bg-muted text-muted-foreground" };
}

function LinhaConvidado({
  convidado,
  slug,
}: {
  convidado: ConvidadoRow;
  slug: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const info = status(convidado);

  function url() {
    return `${window.location.origin}/${slug}/convite/${convidado.codigo}`;
  }

  async function copiarLink() {
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
    if (!convidado.telefone) return;
    const mensagem = `Oi, ${convidado.nome}! Você foi convidado(a) para o nosso casamento 🎉 Confirme sua presença aqui: ${url()}`;
    window.open(linkWhatsApp(convidado.telefone, mensagem), "_blank");
  }

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-2 text-foreground">
        {convidado.nome}
        {convidado.lado && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({convidado.lado})
          </span>
        )}
        {convidado.confirmado && convidado.nomes_acompanhantes && (
          <p className="mt-1 text-xs text-muted-foreground">
            Acompanhantes: {convidado.nomes_acompanhantes}
          </p>
        )}
        {convidado.confirmado && convidado.restricao_alimentar && (
          <p className="mt-1 text-xs text-muted-foreground">
            Restrição alimentar: {convidado.restricao_alimentar}
          </p>
        )}
      </td>
      <td className="px-4 py-2">{convidado.limite_acompanhantes}</td>
      <td className="px-4 py-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${info.classe}`}
        >
          {info.texto}
        </span>
      </td>
      <td className="px-4 py-2">
        {convidado.confirmado
          ? convidado.numero_acompanhantes
          : "–"}
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-3">
          {convidado.telefone && (
            <button
              type="button"
              onClick={abrirWhatsApp}
              className="text-xs text-accent underline"
            >
              Enviar no WhatsApp
            </button>
          )}
          <button
            type="button"
            onClick={copiarLink}
            className="text-xs text-accent underline"
          >
            {copiado ? "Copiado!" : "Copiar link"}
          </button>
          {convidado.confirmado === null && (
            <form action={marcarConfirmadoManual.bind(null, convidado.id)}>
              <button type="submit" className="text-xs text-accent underline">
                Marcar confirmado
              </button>
            </form>
          )}
          <form action={removerConvidado.bind(null, convidado.id)}>
            <button
              type="submit"
              className="text-xs text-muted-foreground underline"
            >
              Remover
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

export function ListaConvidados({
  convidados,
  slug,
}: {
  convidados: ConvidadoRow[];
  slug: string;
}) {
  if (convidados.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">
        Você ainda não adicionou nenhum convidado.
      </p>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Nome</th>
            <th className="px-4 py-2 font-medium">Limite</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Vão</th>
            <th className="px-4 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {convidados.map((convidado) => (
            <LinhaConvidado
              key={convidado.id}
              convidado={convidado}
              slug={slug}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
