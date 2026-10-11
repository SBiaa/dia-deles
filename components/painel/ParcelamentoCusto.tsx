"use client";

import { useActionState } from "react";
import { Check, CalendarRange } from "lucide-react";
import {
  desfazerParcelamento,
  marcarParcela,
  parcelarCusto,
} from "@/app/painel/custos/actions";
import { hojeIso, diasEntre } from "@/lib/datas";
import { formatarData, formatarPreco } from "@/lib/formatar";
import type { ParcelaRow } from "@/lib/db/queries/parcelas";

function FormularioParcelar({ custoId }: { custoId: string }) {
  const [estado, action, pendente] = useActionState(
    parcelarCusto.bind(null, custoId),
    undefined
  );

  return (
    <details className="group rounded-xl border border-border">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-foreground/80 hover:text-accent">
        <CalendarRange size={15} aria-hidden />
        Parcelar este custo
      </summary>
      <form action={action} className="flex flex-col gap-3 border-t border-border p-3.5">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Nº de parcelas
            <input
              name="numero"
              type="number"
              min={2}
              max={48}
              defaultValue={6}
              required
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            1º vencimento
            <input
              name="primeiroVencimento"
              type="date"
              required
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          As parcelas vencem uma por mês, na mesma data.
        </p>
        {estado?.erro && <p className="text-xs text-rosa">{estado.erro}</p>}
        <button
          type="submit"
          disabled={pendente}
          className="self-start rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {pendente ? "Gerando..." : "Gerar parcelas"}
        </button>
      </form>
    </details>
  );
}

export function ParcelamentoCusto({
  custoId,
  podeParcelar,
  parcelas,
}: {
  custoId: string;
  podeParcelar: boolean;
  parcelas: ParcelaRow[];
}) {
  if (parcelas.length === 0) {
    if (!podeParcelar) return null;
    return <FormularioParcelar custoId={custoId} />;
  }

  const hoje = hojeIso();
  const pagas = parcelas.filter((p) => p.paga).length;

  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
        <p className="text-sm font-medium text-foreground">
          Parcelas{" "}
          <span className="font-normal text-muted-foreground">
            · {pagas} de {parcelas.length} pagas
          </span>
        </p>
        <form
          action={desfazerParcelamento.bind(null, custoId)}
          onSubmit={(e) => {
            if (
              !window.confirm(
                "Desfazer o parcelamento? Os pagamentos marcados nas parcelas serão zerados."
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            className="text-xs text-muted-foreground underline hover:text-rosa"
          >
            Desfazer
          </button>
        </form>
      </div>
      <ul className="divide-y divide-border">
        {parcelas.map((p) => {
          const atrasada =
            !p.paga && p.vencimento !== null && diasEntre(hoje, p.vencimento) < 0;
          return (
            <li key={p.id} className="flex items-center gap-3 px-3.5 py-2">
              <form action={marcarParcela.bind(null, p.id)}>
                <button
                  type="submit"
                  aria-label={
                    p.paga
                      ? `Desmarcar parcela ${p.numero}`
                      : `Marcar parcela ${p.numero} como paga`
                  }
                  className={`flex size-6 items-center justify-center rounded-full border-2 transition ${
                    p.paga
                      ? "border-verde bg-verde text-white"
                      : "border-border text-transparent hover:border-verde hover:text-verde/50"
                  }`}
                >
                  <Check size={13} strokeWidth={3} aria-hidden />
                </button>
              </form>
              <span className="w-10 text-xs text-muted-foreground">
                {p.numero}/{parcelas.length}
              </span>
              <span
                className={`flex-1 text-sm ${
                  atrasada
                    ? "font-medium text-rosa"
                    : p.paga
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                }`}
              >
                {formatarData(p.vencimento) ?? "Sem data"}
                {atrasada && " · atrasada"}
              </span>
              <span
                className={`text-sm ${
                  p.paga ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {formatarPreco(p.valor_centavos)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
