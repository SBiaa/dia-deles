"use client";

import { useActionState } from "react";
import { MapPin, Pencil, Trash2, UserRound } from "lucide-react";
import { editarItem, removerItem } from "@/app/painel/cronograma/actions";
import { horarioCurto } from "@/lib/cronograma";
import type { ItemCronogramaRow } from "@/lib/db/queries/cronograma";

const classeCampo =
  "rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-accent";

function EditarItem({ item }: { item: ItemCronogramaRow }) {
  const [estado, action, pendente] = useActionState(
    editarItem.bind(null, item.id),
    undefined
  );

  return (
    <details className="group">
      <summary
        aria-label={`Editar ${item.titulo}`}
        className="flex size-8 cursor-pointer list-none items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Pencil size={14} aria-hidden />
      </summary>
      <form
        action={action}
        className="absolute inset-x-4 z-10 mt-2 grid gap-3 rounded-xl border border-border bg-card p-4 shadow-lg sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Horário
          <input
            type="time"
            name="horario"
            required
            defaultValue={horarioCurto(item.horario)}
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Atividade
          <input
            name="titulo"
            required
            defaultValue={item.titulo}
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Local
          <input name="local" defaultValue={item.local ?? ""} className={classeCampo} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Responsável
          <input
            name="responsavel"
            defaultValue={item.responsavel ?? ""}
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2">
          Detalhes
          <input
            name="descricao"
            defaultValue={item.descricao ?? ""}
            className={classeCampo}
          />
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pendente}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
          >
            {pendente ? "Salvando..." : "Salvar"}
          </button>
          {estado?.erro && <p className="text-xs text-rosa">{estado.erro}</p>}
        </div>
      </form>
    </details>
  );
}

export function ListaCronograma({ itens }: { itens: ItemCronogramaRow[] }) {
  return (
    <ol className="relative flex flex-col gap-3">
      <span
        aria-hidden
        className="absolute bottom-3 left-[3.6rem] top-3 hidden w-px bg-border sm:block"
      />
      {itens.map((item) => (
        <li key={item.id} className="relative flex items-start gap-4">
          <div className="w-14 shrink-0 pt-4 text-right">
            <p className="font-serif text-xl leading-none text-accent">
              {horarioCurto(item.horario)}
            </p>
          </div>
          <span
            aria-hidden
            className="relative z-10 mt-[1.15rem] hidden size-3 shrink-0 rounded-full border-2 border-sol bg-card sm:block"
          />
          <div className="relative min-w-0 flex-1 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium text-foreground">{item.titulo}</h3>
                {item.descricao && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.descricao}
                  </p>
                )}
                {(item.local || item.responsavel) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.local && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground/70">
                        <MapPin size={12} aria-hidden />
                        {item.local}
                      </span>
                    )}
                    {item.responsavel && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-sol/15 px-2.5 py-0.5 text-xs text-[#8a6a1f]">
                        <UserRound size={12} aria-hidden />
                        {item.responsavel}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center">
                <EditarItem item={item} />
                <form
                  action={removerItem.bind(null, item.id)}
                  onSubmit={(e) => {
                    if (!window.confirm(`Remover "${item.titulo}"?`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <button
                    type="submit"
                    aria-label={`Remover ${item.titulo}`}
                    className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
