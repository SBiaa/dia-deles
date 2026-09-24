import { arquivarCusto, registrarPagamento } from "@/app/painel/custos/actions";
import { formatarPreco } from "@/lib/formatar";
import { statusCusto, type StatusCusto } from "@/lib/custos";
import type { CustoRow } from "@/lib/db/queries/custos";

const ROTULOS_STATUS: Record<StatusCusto, string> = {
  a_orcar: "A orçar",
  pendente: "Falta pagar",
  parcial: "Pago parcialmente",
  pago: "Tudo certo",
};

const CORES_STATUS: Record<StatusCusto, string> = {
  a_orcar: "bg-muted text-muted-foreground",
  pendente: "bg-accent/10 text-accent",
  parcial: "bg-accent/10 text-accent",
  pago: "bg-accent text-accent-foreground",
};

export function ListaCustosPainel({ custos }: { custos: CustoRow[] }) {
  if (custos.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">
        Você ainda não registrou nenhum custo.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {custos.map((custo) => {
        const status = statusCusto(custo);
        return (
          <div
            key={custo.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif text-lg text-foreground">
                  {custo.categoria}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CORES_STATUS[status]}`}
                >
                  {ROTULOS_STATUS[status]}
                </span>
              </div>
              {custo.fornecedor && (
                <p className="text-sm text-muted-foreground">
                  {custo.fornecedor}
                </p>
              )}
              {custo.observacoes && (
                <p className="text-sm text-muted-foreground">
                  {custo.observacoes}
                </p>
              )}
              <p className="mt-1 text-sm text-foreground">
                {custo.valor_centavos !== null
                  ? `${formatarPreco(custo.valor_pago_centavos)} de ${formatarPreco(custo.valor_centavos)}`
                  : "Valor ainda não definido"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <form
                action={registrarPagamento.bind(null, custo.id)}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  name="valorPago"
                  defaultValue={(custo.valor_pago_centavos / 100).toFixed(2)}
                  className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
                />
                <button type="submit" className="text-xs text-accent underline">
                  Atualizar pago
                </button>
              </form>

              <form action={arquivarCusto.bind(null, custo.id)}>
                <button
                  type="submit"
                  className="text-xs text-muted-foreground underline"
                >
                  Remover
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
