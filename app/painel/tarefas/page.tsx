import { CircleCheck, Clock, ListChecks, TriangleAlert } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { listarTarefasPainel } from "@/lib/db/queries/tarefas";
import { agruparPorTempo, calcularResumoTarefas } from "@/lib/tarefas";
import { diasEntre, hojeIso } from "@/lib/datas";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { BotaoChecklistSugerido } from "@/components/painel/BotaoChecklistSugerido";
import { FormularioNovaTarefa } from "@/components/painel/FormularioNovaTarefa";
import { ListaTarefasPainel } from "@/components/painel/ListaTarefasPainel";

export default async function PaginaTarefas() {
  const usuario = await exigirSessao();
  const [casamento, tarefas] = await Promise.all([
    buscarCasamentoPorId(usuario.casamentoId),
    listarTarefasPainel(usuario.casamentoId),
  ]);
  const resumo = calcularResumoTarefas(tarefas);
  const hoje = hojeIso();
  const dataCasamento = casamento?.data_casamento ?? null;
  const grupos = agruparPorTempo(tarefas, dataCasamento, hoje);

  const diasRestantes = dataCasamento ? diasEntre(hoje, dataCasamento) : null;

  const percentual =
    resumo.total > 0
      ? Math.round((resumo.concluidas / resumo.total) * 100)
      : 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Checklist
          </h1>
          <p className="mt-2 text-muted-foreground">
            {diasRestantes !== null && diasRestantes >= 0
              ? `Faltam ${diasRestantes} dias para o grande dia. Veja o que fazer em cada fase.`
              : "Organize o que ainda falta fazer até o grande dia."}
          </p>
        </div>
        {resumo.total > 0 && (
          <BotaoChecklistSugerido rotulo="Adicionar sugestões" />
        )}
      </header>

      {resumo.total > 0 && (
        <section aria-label="Resumo" className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <CartaoEstatistica
              rotulo="Concluídas"
              valor={resumo.concluidas}
              icone={CircleCheck}
              cor="bg-verde/10 text-verde"
            />
            <CartaoEstatistica
              rotulo="Pendentes"
              valor={resumo.pendentes}
              icone={Clock}
              cor="bg-sol/15 text-[#8a6a1f]"
            />
            <CartaoEstatistica
              rotulo="Atrasadas"
              valor={resumo.atrasadas}
              icone={TriangleAlert}
              cor="bg-rosa/10 text-rosa"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">
                {resumo.concluidas} de {resumo.total} tarefas concluídas
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
        </section>
      )}

      <FormularioNovaTarefa />

      {resumo.total === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
            <ListChecks size={26} aria-hidden />
          </span>
          <h2 className="mt-5 font-serif text-2xl text-foreground">
            Comece com um checklist pronto
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Geramos as principais tarefas de um casamento, já com prazos
            calculados a partir da data de vocês. É só ajustar, remover ou
            acrescentar o que quiser.
          </p>
          <div className="mt-6">
            <BotaoChecklistSugerido destaque />
          </div>
        </div>
      ) : (
        <ListaTarefasPainel grupos={grupos} />
      )}
    </div>
  );
}
