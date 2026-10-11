"use client";

import {
  BadgeCheck,
  CalendarClock,
  Phone,
  Trash2,
  TrendingDown,
} from "lucide-react";
import {
  desfazerEscolha,
  escolherProposta,
  removerProposta,
} from "@/app/painel/orcamentos/actions";
import { diasEntre } from "@/lib/datas";
import { formatarData, formatarPreco } from "@/lib/formatar";
import type { PropostaRow } from "@/lib/db/queries/propostas";

export type GrupoCategoria = {
  chave: string;
  categoria: string;
  orcamentoCentavos: number | null;
  propostas: PropostaRow[];
};

const moeda = (centavos: number) => formatarPreco(centavos) ?? "R$ 0,00";

function Detalhe({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  if (!valor) return null;
  return (
    <div>
      <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {rotulo}
      </dt>
      <dd className="text-sm text-foreground/80">{valor}</dd>
    </div>
  );
}

function CartaoProposta({
  proposta,
  menor,
  varias,
  orcamento,
  hoje,
}: {
  proposta: PropostaRow;
  menor: number;
  varias: boolean;
  orcamento: number | null;
  hoje: string;
}) {
  const ehMenor = varias && proposta.valor_centavos === menor;
  const diferenca = proposta.valor_centavos - menor;
  const percentual = menor > 0 ? Math.round((diferenca / menor) * 100) : 0;

  const folga = orcamento !== null ? orcamento - proposta.valor_centavos : null;

  const diasValidade = proposta.validade
    ? diasEntre(hoje, proposta.validade)
    : null;

  return (
    <li
      className={`flex flex-col rounded-2xl border bg-card p-5 ${
        proposta.escolhida
          ? "border-verde/50 shadow-[0_0_0_3px_rgba(47,107,87,0.08)]"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-xl leading-snug text-foreground">
          {proposta.fornecedor}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {proposta.escolhida && (
            <span className="inline-flex items-center gap-1 rounded-full bg-verde px-2.5 py-0.5 text-xs font-medium text-white">
              <BadgeCheck size={13} aria-hidden />
              Escolhida
            </span>
          )}
          {ehMenor && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sol/20 px-2.5 py-0.5 text-xs font-medium text-[#8a6a1f]">
              <TrendingDown size={13} aria-hidden />
              Menor preço
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 font-serif text-3xl text-accent">
        {moeda(proposta.valor_centavos)}
      </p>
      <p className="mt-1 min-h-5 text-xs text-muted-foreground">
        {varias && !ehMenor
          ? `${moeda(diferenca)} (+${percentual}%) acima da mais barata`
          : ehMenor
            ? "Valor mais baixo desta categoria"
            : ""}
      </p>

      {folga !== null && (
        <p
          className={`mt-2 text-xs font-medium ${
            folga >= 0 ? "text-verde" : "text-rosa"
          }`}
        >
          {folga >= 0
            ? `Cabe no orçamento (sobram ${moeda(folga)})`
            : `Passa do orçamento em ${moeda(Math.abs(folga))}`}
        </p>
      )}

      <dl className="mt-4 flex flex-col gap-2.5">
        <Detalhe rotulo="Pagamento" valor={proposta.condicoes} />
        <Detalhe rotulo="Inclui" valor={proposta.inclui} />
        <Detalhe rotulo="Observações" valor={proposta.observacoes} />
      </dl>

      {(proposta.contato || diasValidade !== null) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {proposta.contato && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-foreground/70">
              <Phone size={12} aria-hidden />
              {proposta.contato}
            </span>
          )}
          {diasValidade !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                diasValidade < 0
                  ? "bg-rosa/10 text-rosa"
                  : diasValidade <= 7
                    ? "bg-sol/15 text-[#8a6a1f]"
                    : "bg-muted text-foreground/70"
              }`}
            >
              <CalendarClock size={12} aria-hidden />
              {diasValidade < 0
                ? `Venceu em ${formatarData(proposta.validade)}`
                : diasValidade === 0
                  ? "Vence hoje"
                  : `Válida até ${formatarData(proposta.validade)}`}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        {proposta.escolhida ? (
          <form action={desfazerEscolha.bind(null, proposta.id)}>
            <button
              type="submit"
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-rosa/40 hover:text-rosa"
            >
              Desfazer escolha
            </button>
          </form>
        ) : (
          <form action={escolherProposta.bind(null, proposta.id)}>
            <button
              type="submit"
              className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition hover:opacity-90"
            >
              Escolher esta proposta
            </button>
          </form>
        )}
        <form
          action={removerProposta.bind(null, proposta.id)}
          onSubmit={(e) => {
            if (!window.confirm(`Remover a proposta de ${proposta.fornecedor}?`)) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            aria-label={`Remover proposta de ${proposta.fornecedor}`}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
          >
            <Trash2 size={15} aria-hidden />
          </button>
        </form>
      </div>
    </li>
  );
}

export function ComparadorPropostas({
  grupos,
  hoje,
}: {
  grupos: GrupoCategoria[];
  hoje: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      {grupos.map((grupo) => {
        const menor = Math.min(...grupo.propostas.map((p) => p.valor_centavos));
        const escolhida = grupo.propostas.find((p) => p.escolhida);
        const varias = grupo.propostas.length > 1;

        return (
          <section key={grupo.chave}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
              <div>
                <h2 className="font-serif text-2xl text-foreground">
                  {grupo.categoria}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {grupo.propostas.length}{" "}
                  {grupo.propostas.length === 1 ? "proposta" : "propostas"}
                  {grupo.orcamentoCentavos !== null &&
                    ` · orçamento de ${moeda(grupo.orcamentoCentavos)}`}
                </p>
              </div>
              {escolhida ? (
                <p className="text-sm font-medium text-verde">
                  Contratado: {escolhida.fornecedor}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma escolhida ainda
                </p>
              )}
            </div>

            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {grupo.propostas.map((p) => (
                <CartaoProposta
                  key={p.id}
                  proposta={p}
                  menor={menor}
                  varias={varias}
                  orcamento={grupo.orcamentoCentavos}
                  hoje={hoje}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
