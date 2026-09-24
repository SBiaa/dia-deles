import {
  concluirTarefa,
  reabrirTarefa,
  arquivarTarefa,
} from "@/app/painel/tarefas/actions";
import { formatarData } from "@/lib/formatar";
import { estaAtrasada } from "@/lib/tarefas";
import type { TarefaRow } from "@/lib/db/queries/tarefas";

export function ListaTarefasPainel({ tarefas }: { tarefas: TarefaRow[] }) {
  if (tarefas.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">
        Você ainda não adicionou nenhuma tarefa.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {tarefas.map((tarefa) => {
        const atrasada = estaAtrasada(tarefa);
        return (
          <div
            key={tarefa.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`font-serif text-lg ${
                    tarefa.concluida
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {tarefa.titulo}
                </p>
                {atrasada && (
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    Atrasada
                  </span>
                )}
              </div>
              {tarefa.descricao && (
                <p className="text-sm text-muted-foreground">
                  {tarefa.descricao}
                </p>
              )}
              {tarefa.prazo && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Prazo: {formatarData(tarefa.prazo)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {tarefa.concluida ? (
                <form action={reabrirTarefa.bind(null, tarefa.id)}>
                  <button
                    type="submit"
                    className="text-xs text-accent underline"
                  >
                    Reabrir
                  </button>
                </form>
              ) : (
                <form action={concluirTarefa.bind(null, tarefa.id)}>
                  <button
                    type="submit"
                    className="text-xs text-accent underline"
                  >
                    Concluir
                  </button>
                </form>
              )}

              <form action={arquivarTarefa.bind(null, tarefa.id)}>
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
