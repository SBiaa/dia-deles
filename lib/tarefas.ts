import type { TarefaRow } from "@/lib/db/queries/tarefas";
import { diasEntre, hojeIso } from "@/lib/datas";

export function estaAtrasada(tarefa: TarefaRow): boolean {
  if (tarefa.concluida || !tarefa.prazo) return false;
  return tarefa.prazo < hojeIso();
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

export type GrupoTarefas = {
  id: string;
  rotulo: string;
  dica?: string;
  tom: "atrasada" | "normal" | "concluida";
  tarefas: TarefaRow[];
};

/** Faixas de "dias antes do casamento", da mais distante para a mais próxima. */
const FAIXAS = [
  { id: "12m", minDias: 330, rotulo: "12 meses ou mais antes" },
  { id: "6m", minDias: 180, rotulo: "6 a 12 meses antes" },
  { id: "3m", minDias: 90, rotulo: "3 a 6 meses antes" },
  { id: "1m", minDias: 30, rotulo: "1 a 3 meses antes" },
  { id: "ultimo-mes", minDias: 7, rotulo: "No último mês" },
  { id: "semana", minDias: 0, rotulo: "Na semana do casamento" },
  { id: "depois", minDias: -Infinity, rotulo: "Depois do casamento" },
] as const;

/**
 * Agrupa as tarefas pendentes por quanto tempo falta, em relação à data do
 * casamento. Atrasadas ficam em destaque no topo e concluídas no fim.
 */
export function agruparPorTempo(
  tarefas: TarefaRow[],
  dataCasamento: string | null,
  hoje: string
): GrupoTarefas[] {
  const pendentes = tarefas.filter((t) => !t.concluida);
  const concluidas = tarefas.filter((t) => t.concluida);

  const atrasadas = pendentes.filter((t) => t.prazo && t.prazo < hoje);
  const restantes = pendentes.filter((t) => !(t.prazo && t.prazo < hoje));

  const grupos: GrupoTarefas[] = [];

  if (atrasadas.length > 0) {
    grupos.push({
      id: "atrasadas",
      rotulo: "Atrasadas",
      dica: "Passaram do prazo. Vale resolver ou ajustar a data.",
      tom: "atrasada",
      tarefas: atrasadas,
    });
  }

  if (dataCasamento) {
    const semPrazo: TarefaRow[] = [];
    const porFaixa = new Map<string, TarefaRow[]>();
    for (const tarefa of restantes) {
      if (!tarefa.prazo) {
        semPrazo.push(tarefa);
        continue;
      }
      const diasAntes = diasEntre(tarefa.prazo, dataCasamento);
      const faixa = FAIXAS.find((f) => diasAntes >= f.minDias) ?? FAIXAS[6];
      porFaixa.set(faixa.id, [...(porFaixa.get(faixa.id) ?? []), tarefa]);
    }
    for (const faixa of FAIXAS) {
      const lista = porFaixa.get(faixa.id);
      if (lista?.length) {
        grupos.push({
          id: faixa.id,
          rotulo: faixa.rotulo,
          tom: "normal",
          tarefas: lista,
        });
      }
    }
    if (semPrazo.length > 0) {
      grupos.push({
        id: "sem-prazo",
        rotulo: "Sem prazo definido",
        tom: "normal",
        tarefas: semPrazo,
      });
    }
  } else if (restantes.length > 0) {
    grupos.push({
      id: "a-fazer",
      rotulo: "A fazer",
      tom: "normal",
      tarefas: restantes,
    });
  }

  if (concluidas.length > 0) {
    grupos.push({
      id: "concluidas",
      rotulo: "Concluídas",
      tom: "concluida",
      tarefas: concluidas,
    });
  }

  return grupos;
}
