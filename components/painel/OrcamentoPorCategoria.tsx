"use client";

import { useActionState } from "react";
import { Check, PiggyBank, Plus } from "lucide-react";
import { salvarOrcamentoCategoria } from "@/app/painel/custos/actions";
import { CATEGORIAS_SUGERIDAS, type LinhaCategoria } from "@/lib/financeiro";
import { formatarPreco } from "@/lib/formatar";

const moeda = (centavos: number) => formatarPreco(centavos) ?? "R$ 0,00";

function LinhaOrcamento({ linha }: { linha: LinhaCategoria }) {
  const [estado, action, pendente] = useActionState(
    salvarOrcamentoCategoria,
    undefined
  );

  const { orcamentoCentavos, contratadoCentavos, pagoCentavos } = linha;
  const base = Math.max(orcamentoCentavos ?? 0, contratadoCentavos, 1);
  const larguraContratado = Math.round((contratadoCentavos / base) * 100);
  const larguraPago = Math.round((pagoCentavos / base) * 100);
  const diferenca =
    orcamentoCentavos !== null ? orcamentoCentavos - contratadoCentavos : null;
  const estourou = diferenca !== null && diferenca < 0;

  return (
    <li className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{linha.categoria}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {contratadoCentavos > 0
              ? `${moeda(contratadoCentavos)} contratado`
              : "Nada contratado ainda"}
            {pagoCentavos > 0 && ` · ${moeda(pagoCentavos)} pago`}
          </p>
        </div>

        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="categoria" value={linha.categoria} />
          <label className="sr-only" htmlFor={`orc-${linha.chave}`}>
            Orçamento de {linha.categoria}
          </label>
          <span className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            >
              R$
            </span>
            <input
              id={`orc-${linha.chave}`}
              name="valor"
              inputMode="decimal"
              placeholder="Orçamento"
              defaultValue={
                orcamentoCentavos !== null
                  ? (orcamentoCentavos / 100).toFixed(2).replace(".", ",")
                  : ""
              }
              className="w-36 rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
            />
          </span>
          <button
            type="submit"
            disabled={pendente}
            aria-label={`Salvar orçamento de ${linha.categoria}`}
            className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground/70 transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent disabled:opacity-50"
          >
            <Check size={16} aria-hidden />
          </button>
        </form>
      </div>

      <div
        role="img"
        aria-label={`${moeda(contratadoCentavos)} contratados de ${
          orcamentoCentavos !== null ? moeda(orcamentoCentavos) : "sem orçamento"
        }`}
        className="relative h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${
            estourou ? "bg-rosa/40" : "bg-accent/30"
          }`}
          style={{ width: `${larguraContratado}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-verde"
          style={{ width: `${larguraPago}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          {orcamentoCentavos !== null
            ? `Orçamento: ${moeda(orcamentoCentavos)}`
            : "Sem orçamento definido"}
        </span>
        {diferenca !== null && (
          <span
            className={`font-medium ${estourou ? "text-rosa" : "text-verde"}`}
          >
            {estourou
              ? `Passou ${moeda(Math.abs(diferenca))}`
              : `Sobram ${moeda(diferenca)}`}
          </span>
        )}
      </div>
      {estado?.erro && <p className="text-xs text-rosa">{estado.erro}</p>}
    </li>
  );
}

function NovaCategoria() {
  const [estado, action, pendente] = useActionState(
    salvarOrcamentoCategoria,
    undefined
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-end sm:p-5"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="nova-categoria" className="text-sm text-muted-foreground">
          Categoria
        </label>
        <input
          id="nova-categoria"
          name="categoria"
          list="categorias-sugeridas"
          required
          placeholder="Ex.: Buffet"
          className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
        <datalist id="categorias-sugeridas">
          {CATEGORIAS_SUGERIDAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="flex flex-col gap-1.5 sm:w-44">
        <label htmlFor="novo-orcamento" className="text-sm text-muted-foreground">
          Orçamento
        </label>
        <input
          id="novo-orcamento"
          name="valor"
          inputMode="decimal"
          required
          placeholder="R$ 0,00"
          className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <button
        type="submit"
        disabled={pendente}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        <Plus size={16} aria-hidden />
        {pendente ? "Salvando..." : "Definir orçamento"}
      </button>
      {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
    </form>
  );
}

export function OrcamentoPorCategoria({ linhas }: { linhas: LinhaCategoria[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border p-5 sm:px-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sol/15 text-[#8a6a1f]">
          <PiggyBank size={20} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Orçamento por categoria
          </h2>
          <p className="text-xs text-muted-foreground">
            Defina quanto cada parte pode custar e acompanhe o que já foi
            contratado.
          </p>
        </div>
      </div>

      {linhas.length > 0 ? (
        <ul className="divide-y divide-border">
          {linhas.map((linha) => (
            <LinhaOrcamento key={linha.chave} linha={linha} />
          ))}
        </ul>
      ) : (
        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
          Comece definindo um orçamento para a primeira categoria.
        </p>
      )}

      <NovaCategoria />
    </section>
  );
}
