import type { TarefaRow } from "@/lib/db/queries/tarefas";

export function estaAtrasada(tarefa: TarefaRow): boolean {
  if (tarefa.concluida || !tarefa.prazo) return false;
  const hoje = new Date().toISOString().slice(0, 10);
  return tarefa.prazo < hoje;
}

export function calcularResumoTarefas(tarefas: TarefaRow[]) {
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.concluida).length;
  const atrasadas = tarefas.filter(estaAtrasada).length;
  return {
    total,
    concluidas,
    pendentes: total - concluidas,
    atrasadas,
  };
}
