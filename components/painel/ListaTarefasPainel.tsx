"use client";

import { CalendarDays, Check, Trash2 } from "lucide-react";
import {
  concluirTarefa,
  reabrirTarefa,
  arquivarTarefa,
} from "@/app/painel/tarefas/actions";
import { formatarData } from "@/lib/formatar";
import { estaAtrasada, type GrupoTarefas } from "@/lib/tarefas";
import type { TarefaRow } from "@/lib/db/queries/tarefas";

function LinhaTarefa({ tarefa }: { tarefa: TarefaRow }) {
  const atrasada = estaAtrasada(tarefa);
  const prazo = formatarData(tarefa.prazo);

  return (
    <li className="flex items-start gap-4 p-4 sm:p-5">
      <form
        action={(tarefa.concluida ? reabrirTarefa : concluirTarefa).bind(
          null,
          tarefa.id
        )}
      >
        <button
          type="submit"
          aria-label={
            tarefa.concluida
              ? `Reabrir "${tarefa.titulo}"`
              : `Concluir "${tarefa.titulo}"`
          }
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
            tarefa.concluida
              ? "border-verde bg-verde text-white hover:opacity-80"
              : "border-border text-transparent hover:border-verde hover:text-verde/50"
          }`}
        >
          <Check size={15} strokeWidth={3} aria-hidden />
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <p
          className={`font-medium ${
            tarefa.concluida
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {tarefa.titulo}
        </p>
        {tarefa.descricao && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tarefa.descricao}
          </p>
        )}
        {prazo && (
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              atrasada
                ? "bg-rosa/10 text-rosa"
                : tarefa.concluida
                  ? "bg-muted text-muted-foreground"
                  : "bg-sol/15 text-[#8a6a1f]"
            }`}
          >
            <CalendarDays size={12} aria-hidden />
            {atrasada ? `Atrasada · ${prazo}` : `Até ${prazo}`}
          </span>
        )}
      </div>

      <form
        action={arquivarTarefa.bind(null, tarefa.id)}
        onSubmit={(e) => {
          if (!window.confirm(`Remover "${tarefa.titulo}"?`)) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          aria-label={`Remover ${tarefa.titulo}`}
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
        >
          <Trash2 size={15} aria-hidden />
        </button>
      </form>
    </li>
  );
}

const CORES_TOM = {
  atrasada: "text-rosa",
  normal: "text-muted-foreground",
  concluida: "text-verde",
} as const;

function SecaoTempo({ grupo }: { grupo: GrupoTarefas }) {
  return (
    <section
      className={`rounded-2xl border bg-card ${
        grupo.tom === "atrasada" ? "border-rosa/30" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-3">
        <h2
          className={`text-xs font-medium tracking-[0.14em] uppercase ${CORES_TOM[grupo.tom]}`}
        >
          {grupo.rotulo} · {grupo.tarefas.length}
        </h2>
        {grupo.dica && (
          <p className="text-xs text-muted-foreground">{grupo.dica}</p>
        )}
      </div>
      <ul className="divide-y divide-border">
        {grupo.tarefas.map((tarefa) => (
          <LinhaTarefa key={tarefa.id} tarefa={tarefa} />
        ))}
      </ul>
    </section>
  );
}

export function ListaTarefasPainel({ grupos }: { grupos: GrupoTarefas[] }) {
  return (
    <div className="flex flex-col gap-6">
      {grupos.map((grupo) => (
        <SecaoTempo key={grupo.id} grupo={grupo} />
      ))}
    </div>
  );
}
