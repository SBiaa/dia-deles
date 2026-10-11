"use client";

import { Receipt, Trash2 } from "lucide-react";
import { arquivarCusto, registrarPagamento } from "@/app/painel/custos/actions";
import { formatarPreco } from "@/lib/formatar";
import { statusCusto, type StatusCusto } from "@/lib/custos";
import type { CustoRow } from "@/lib/db/queries/custos";
import type { ParcelaRow } from "@/lib/db/queries/parcelas";
import { ParcelamentoCusto } from "@/components/painel/ParcelamentoCusto";

const ROTULOS_STATUS: Record<StatusCusto, string> = {
  a_orcar: "A orçar",
  pendente: "Falta pagar",
  parcial: "Pago em parte",
  pago: "Tudo certo",
};

const CORES_STATUS: Record<StatusCusto, string> = {
  a_orcar: "bg-muted text-muted-foreground",
  pendente: "bg-rosa/10 text-rosa",
  parcial: "bg-sol/15 text-[#8a6a1f]",
  pago: "bg-verde/10 text-verde",
};

const CORES_BARRA: Record<StatusCusto, string> = {
  a_orcar: "bg-border",
  pendente: "bg-rosa",
  parcial: "bg-sol",
  pago: "bg-verde",
};

function CartaoCusto({
  custo,
  parcelas,
}: {
  custo: CustoRow;
  parcelas: ParcelaRow[];
}) {
  const parcelado = parcelas.length > 0;
  const status = statusCusto(custo);
  const definido = custo.valor_centavos !== null && custo.valor_centavos > 0;
  const percentual = definido
    ? Math.min(
        100,
        Math.round((custo.valor_pago_centavos / custo.valor_centavos!) * 100)
      )
    : 0;

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(20,38,45,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-xl leading-snug text-foreground">
            {custo.categoria}
          </h3>
          {custo.fornecedor && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {custo.fornecedor}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${CORES_STATUS[status]}`}
        >
          {ROTULOS_STATUS[status]}
        </span>
      </div>

      {custo.observacoes && (
        <p className="mt-2 text-sm text-muted-foreground">{custo.observacoes}</p>
      )}

      <div className="mt-5">
        {definido ? (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-serif text-2xl text-foreground">
                {formatarPreco(custo.valor_pago_centavos)}
              </p>
              <p className="text-sm text-muted-foreground">
                de {formatarPreco(custo.valor_centavos)}
              </p>
            </div>
            <div
              role="progressbar"
              aria-valuenow={percentual}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={`h-full rounded-full transition-all ${CORES_BARRA[status]}`}
                style={{ width: `${percentual}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Valor ainda não definido.
          </p>
        )}
      </div>

      {(definido || parcelado) && (
        <div className="mt-4">
          <ParcelamentoCusto
            custoId={custo.id}
            podeParcelar={definido}
            parcelas={parcelas}
          />
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        {parcelado ? (
          <span className="text-xs text-muted-foreground">
            Pago calculado pelas parcelas
          </span>
        ) : (
        <form
          action={registrarPagamento.bind(null, custo.id)}
          className="flex items-center gap-2"
        >
          <label className="sr-only" htmlFor={`pago-${custo.id}`}>
            Valor pago
          </label>
          <span className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            >
              R$
            </span>
            <input
              id={`pago-${custo.id}`}
              type="text"
              name="valorPago"
              inputMode="decimal"
              defaultValue={(custo.valor_pago_centavos / 100).toFixed(2)}
              className="w-28 rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-accent"
            />
          </span>
          <button
            type="submit"
            className="rounded-full border border-border px-3 py-2 text-xs font-medium text-foreground/80 transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
          >
            Atualizar pago
          </button>
        </form>
        )}

        <form
          action={arquivarCusto.bind(null, custo.id)}
          onSubmit={(e) => {
            if (!window.confirm(`Remover "${custo.categoria}"?`)) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            aria-label={`Remover ${custo.categoria}`}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
          >
            <Trash2 size={15} aria-hidden />
          </button>
        </form>
      </div>
    </li>
  );
}

export function ListaCustosPainel({
  custos,
  parcelas,
}: {
  custos: CustoRow[];
  parcelas: ParcelaRow[];
}) {
  if (custos.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
          <Receipt size={26} aria-hidden />
        </span>
        <h2 className="mt-5 font-serif text-2xl text-foreground">
          Nenhum custo registrado
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Comece pelo que já está fechado, como buffet, local ou fotógrafo, e
          acompanhe aqui o que já foi pago e o que falta.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {custos.map((custo) => (
        <CartaoCusto
          key={custo.id}
          custo={custo}
          parcelas={parcelas.filter((p) => p.custo_id === custo.id)}
        />
      ))}
    </ul>
  );
}
