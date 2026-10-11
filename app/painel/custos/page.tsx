import {
  CircleCheck,
  Hourglass,
  PiggyBank,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { listarCustosPainel } from "@/lib/db/queries/custos";
import { listarOrcamentos } from "@/lib/db/queries/orcamentos";
import { listarParcelas } from "@/lib/db/queries/parcelas";
import { calcularResumoCustos } from "@/lib/custos";
import { resumirPorCategoria } from "@/lib/financeiro";
import { formatarPreco } from "@/lib/formatar";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { FormularioNovoCusto } from "@/components/painel/FormularioNovoCusto";
import { ListaCustosPainel } from "@/components/painel/ListaCustosPainel";
import { OrcamentoPorCategoria } from "@/components/painel/OrcamentoPorCategoria";
import {
  ProximosVencimentos,
  type ItemVencimento,
} from "@/components/painel/ProximosVencimentos";

export default async function PaginaCustos() {
  const usuario = await exigirSessao();
  const [custos, orcamentos, parcelas] = await Promise.all([
    listarCustosPainel(usuario.casamentoId),
    listarOrcamentos(usuario.casamentoId),
    listarParcelas(usuario.casamentoId),
  ]);
  const resumo = calcularResumoCustos(custos);
  const linhas = resumirPorCategoria(custos, orcamentos);

  const orcamentoTotal = orcamentos.reduce((s, o) => s + o.valor_centavos, 0);
  const passouDoOrcamento =
    orcamentoTotal > 0 && resumo.totalPrevistoCentavos > orcamentoTotal
      ? resumo.totalPrevistoCentavos - orcamentoTotal
      : 0;

  const percentual =
    resumo.totalPrevistoCentavos > 0
      ? Math.min(
          100,
          Math.round(
            (resumo.totalPagoCentavos / resumo.totalPrevistoCentavos) * 100
          )
        )
      : 0;

  const custoPorId = new Map(custos.map((c) => [c.id, c]));
  const totalPorCusto = new Map<string, number>();
  for (const p of parcelas) {
    totalPorCusto.set(p.custo_id, (totalPorCusto.get(p.custo_id) ?? 0) + 1);
  }
  const vencimentos: ItemVencimento[] = parcelas
    .filter((p) => !p.paga)
    .map((p) => {
      const custo = custoPorId.get(p.custo_id);
      return {
        parcelaId: p.id,
        categoria: custo?.categoria ?? "Custo",
        fornecedor: custo?.fornecedor ?? null,
        numero: p.numero,
        total: totalPorCusto.get(p.custo_id) ?? 1,
        valorCentavos: p.valor_centavos,
        vencimento: p.vencimento,
      };
    });

  const moeda = (centavos: number) => formatarPreco(centavos) ?? "R$ 0,00";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">
          Financeiro
        </h1>
        <p className="mt-2 text-muted-foreground">
          Orçamento por categoria, parcelas e vencimentos: o previsto contra o
          que realmente foi contratado e pago.
        </p>
      </header>

      <section aria-label="Resumo" className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CartaoEstatistica
            rotulo="Orçamento"
            valor={moeda(orcamentoTotal)}
            icone={PiggyBank}
            cor="bg-sol/15 text-[#8a6a1f]"
          />
          <CartaoEstatistica
            rotulo="Contratado"
            valor={moeda(resumo.totalPrevistoCentavos)}
            icone={Wallet}
            cor="bg-accent/10 text-accent"
          />
          <CartaoEstatistica
            rotulo="Já pago"
            valor={moeda(resumo.totalPagoCentavos)}
            icone={CircleCheck}
            cor="bg-verde/10 text-verde"
          />
          <CartaoEstatistica
            rotulo="Falta pagar"
            valor={moeda(resumo.totalFaltaCentavos)}
            icone={Hourglass}
            cor="bg-rosa/10 text-rosa"
          />
        </div>

        {passouDoOrcamento > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-rosa/30 bg-rosa/5 p-4 text-sm text-rosa">
            <TriangleAlert size={18} aria-hidden className="shrink-0" />
            <p>
              O contratado passou {moeda(passouDoOrcamento)} do orçamento
              total. Vale revisar as categorias abaixo.
            </p>
          </div>
        )}

        {resumo.totalPrevistoCentavos > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">
                Pagamentos concluídos
              </p>
              <p className="font-serif text-2xl text-sol">{percentual}%</p>
            </div>
            <div
              role="progressbar"
              aria-valuenow={percentual}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-sol transition-all"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <OrcamentoPorCategoria linhas={linhas} />

      <ProximosVencimentos itens={vencimentos} />

      <div className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl text-foreground">Custos</h2>
        <FormularioNovoCusto />
        <ListaCustosPainel custos={custos} parcelas={parcelas} />
      </div>
    </div>
  );
}
