import { exigirSessao } from "@/lib/dal";
import { listarTarefasPainel } from "@/lib/db/queries/tarefas";
import { calcularResumoTarefas } from "@/lib/tarefas";
import { FormularioNovaTarefa } from "@/components/painel/FormularioNovaTarefa";
import { ListaTarefasPainel } from "@/components/painel/ListaTarefasPainel";

export default async function PaginaTarefas() {
  const usuario = await exigirSessao();
  const tarefas = await listarTarefasPainel(usuario.casamentoId);
  const resumo = calcularResumoTarefas(tarefas);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl text-foreground">Checklist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Organize o que ainda falta fazer até o grande dia.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Concluídas</p>
          <p className="mt-1 font-serif text-lg text-foreground">
            {resumo.concluidas} de {resumo.total}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="mt-1 font-serif text-lg text-foreground">
            {resumo.pendentes}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Atrasadas</p>
          <p className="mt-1 font-serif text-lg text-accent">
            {resumo.atrasadas}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <FormularioNovaTarefa />
      </div>

      <ListaTarefasPainel tarefas={tarefas} />
    </div>
  );
}
