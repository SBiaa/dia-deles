"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Link2,
  MessageCircle,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  marcarConfirmadoManual,
  removerConvidado,
} from "@/app/painel/convidados/actions";
import type { ConvidadoRow } from "@/lib/db/queries/convidados";
import { linkWhatsApp } from "@/lib/whatsapp";

type Filtro = "todos" | "confirmados" | "pendentes" | "recusados";

function statusDe(c: ConvidadoRow): { texto: string; classe: string } {
  if (c.confirmado === null) {
    return { texto: "Aguardando", classe: "bg-sol/15 text-[#8a6a1f]" };
  }
  if (c.confirmado) {
    return { texto: "Confirmou", classe: "bg-verde/10 text-verde" };
  }
  return { texto: "Não vai", classe: "bg-rosa/10 text-rosa" };
}

function passaNoFiltro(c: ConvidadoRow, filtro: Filtro) {
  if (filtro === "confirmados") return c.confirmado === true;
  if (filtro === "pendentes") return c.confirmado === null;
  if (filtro === "recusados") return c.confirmado === false;
  return true;
}

const botaoIcone =
  "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent";

function LinhaConvidado({
  convidado,
  slug,
}: {
  convidado: ConvidadoRow;
  slug: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const info = statusDe(convidado);
  const inicial = convidado.nome.trim().charAt(0).toUpperCase() || "?";

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

  const vao = convidado.confirmado ? 1 + convidado.numero_acompanhantes : null;

  return (
    <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sol-suave font-serif text-lg text-accent">
          {inicial}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium text-foreground">
              {convidado.nome}
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${info.classe}`}
            >
              {info.texto}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {[
              convidado.lado ? `Lado ${convidado.lado}` : null,
              vao !== null
                ? `${vao} ${vao === 1 ? "pessoa vai" : "pessoas vão"}`
                : convidado.limite_acompanhantes > 0
                  ? `Até ${convidado.limite_acompanhantes} acompanhante${convidado.limite_acompanhantes > 1 ? "s" : ""}`
                  : "Sem acompanhantes",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
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
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {convidado.telefone && (
          <button type="button" onClick={abrirWhatsApp} className={botaoIcone}>
            <MessageCircle size={14} aria-hidden />
            WhatsApp
          </button>
        )}
        <button type="button" onClick={copiarLink} className={botaoIcone}>
          {copiado ? (
            <Check size={14} aria-hidden />
          ) : (
            <Link2 size={14} aria-hidden />
          )}
          {copiado ? "Copiado!" : "Copiar link"}
        </button>
        {convidado.confirmado === null && (
          <form action={marcarConfirmadoManual.bind(null, convidado.id)}>
            <button type="submit" className={botaoIcone}>
              <Check size={14} aria-hidden />
              Marcar confirmado
            </button>
          </form>
        )}
        <form
          action={removerConvidado.bind(null, convidado.id)}
          onSubmit={(e) => {
            if (!window.confirm(`Remover ${convidado.nome}?`)) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            aria-label={`Remover ${convidado.nome}`}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
          >
            <Trash2 size={15} aria-hidden />
          </button>
        </form>
      </div>
    </li>
  );
}

export function ListaConvidados({
  convidados,
  slug,
}: {
  convidados: ConvidadoRow[];
  slug: string;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");

  const contagens = useMemo(
    () => ({
      todos: convidados.length,
      confirmados: convidados.filter((c) => c.confirmado === true).length,
      pendentes: convidados.filter((c) => c.confirmado === null).length,
      recusados: convidados.filter((c) => c.confirmado === false).length,
    }),
    [convidados]
  );

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return convidados.filter(
      (c) =>
        passaNoFiltro(c, filtro) &&
        (!termo || c.nome.toLowerCase().includes(termo))
    );
  }, [convidados, filtro, busca]);

  if (convidados.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
          <UserRound size={26} aria-hidden />
        </span>
        <h2 className="mt-5 font-serif text-2xl text-foreground">
          Sua lista começa aqui
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Adicione o primeiro convidado acima. Cada pessoa ou família recebe um
          link próprio para confirmar presença.
        </p>
      </div>
    );
  }

  const abas: { id: Filtro; rotulo: string }[] = [
    { id: "todos", rotulo: "Todos" },
    { id: "confirmados", rotulo: "Confirmaram" },
    { id: "pendentes", rotulo: "Aguardando" },
    { id: "recusados", rotulo: "Não vão" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div
          role="tablist"
          aria-label="Filtrar convidados"
          className="flex flex-wrap gap-2"
        >
          {abas.map(({ id, rotulo }) => {
            const ativo = filtro === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setFiltro(id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  ativo
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-foreground/70 hover:text-foreground"
                }`}
              >
                {rotulo}{" "}
                <span className={ativo ? "text-white/70" : "text-muted-foreground"}>
                  {contagens[id]}
                </span>
              </button>
            );
          })}
        </div>

        <label className="relative block sm:w-60">
          <span className="sr-only">Buscar convidado</span>
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            className="w-full rounded-full border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-accent"
          />
        </label>
      </div>

      {visiveis.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">
          Nenhum convidado encontrado.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {visiveis.map((convidado) => (
            <LinhaConvidado
              key={convidado.id}
              convidado={convidado}
              slug={slug}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
