import { exigirSessao } from "@/lib/dal";
import { listarCustosPainel } from "@/lib/db/queries/custos";
import { calcularResumoCustos } from "@/lib/custos";
import { formatarPreco } from "@/lib/formatar";
import { FormularioNovoCusto } from "@/components/painel/FormularioNovoCusto";
import { ListaCustosPainel } from "@/components/painel/ListaCustosPainel";

export default async function PaginaCustos() {
  const usuario = await exigirSessao();
  const custos = await listarCustosPainel(usuario.casamentoId);
  const resumo = calcularResumoCustos(custos);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl text-foreground">
        Custos do casamento
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Registre os gastos, o que já foi pago e o que ainda falta.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Previsto</p>
          <p className="mt-1 font-serif text-lg text-foreground">
            {formatarPreco(resumo.totalPrevistoCentavos)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Já pago</p>
          <p className="mt-1 font-serif text-lg text-accent">
            {formatarPreco(resumo.totalPagoCentavos)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Falta pagar</p>
          <p className="mt-1 font-serif text-lg text-foreground">
            {formatarPreco(resumo.totalFaltaCentavos)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <FormularioNovoCusto />
      </div>

      <ListaCustosPainel custos={custos} />
    </div>
  );
}
