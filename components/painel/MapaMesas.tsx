"use client";

import {
  useActionState,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import {
  GripVertical,
  Pencil,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  editarMesa,
  moverConvidado,
  removerMesa,
} from "@/app/painel/mesas/actions";
import type { MesaRow } from "@/lib/db/queries/mesas";
import type { ConvidadoMesa } from "@/lib/mesas";

type Destino = string | null; // id da mesa ou null = sem mesa

function Assentos({
  capacidade,
  ocupados,
}: {
  capacidade: number;
  ocupados: number;
}) {
  const passou = ocupados > capacidade;
  const raio = 36;
  const tamanho = capacidade > 20 ? 3 : capacidade > 12 ? 4 : 5;

  return (
    <svg viewBox="0 0 100 100" className="size-24 shrink-0" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="21"
        fill="var(--sol-suave)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      {Array.from({ length: capacidade }, (_, i) => {
        const angulo = (i / capacidade) * Math.PI * 2 - Math.PI / 2;
        const ocupado = i < ocupados;
        return (
          <circle
            key={i}
            cx={50 + Math.cos(angulo) * raio}
            cy={50 + Math.sin(angulo) * raio}
            r={tamanho}
            fill={
              ocupado
                ? passou
                  ? "var(--rosa)"
                  : "var(--accent)"
                : "var(--card)"
            }
            stroke={ocupado ? "none" : "var(--border)"}
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

function SeletorMesa({
  convidado,
  mesas,
  lotacao,
  onMover,
}: {
  convidado: ConvidadoMesa;
  mesas: MesaRow[];
  lotacao: Map<string, number>;
  onMover: (mesaId: Destino) => void;
}) {
  return (
    <select
      aria-label={`Mesa de ${convidado.nome}`}
      value={convidado.mesaId ?? ""}
      onChange={(e) => onMover(e.target.value || null)}
      className="w-full rounded-lg border border-border bg-background py-1.5 pl-2 pr-6 text-xs text-foreground/80 outline-none focus:border-accent"
    >
      <option value="">Sem mesa</option>
      {mesas.map((m) => {
        const livres = m.capacidade - (lotacao.get(m.id) ?? 0);
        return (
          <option key={m.id} value={m.id}>
            {m.nome} ({livres >= 0 ? `${livres} livres` : "lotada"})
          </option>
        );
      })}
    </select>
  );
}

function ChipConvidado({
  convidado,
  mesas,
  lotacao,
  onMover,
  onArrastar,
}: {
  convidado: ConvidadoMesa;
  mesas: MesaRow[];
  lotacao: Map<string, number>;
  onMover: (id: string, mesaId: Destino) => void;
  onArrastar: (id: string | null) => void;
}) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", convidado.id);
        e.dataTransfer.effectAllowed = "move";
        onArrastar(convidado.id);
      }}
      onDragEnd={() => onArrastar(null)}
      className="cursor-grab rounded-xl border border-border bg-card px-2.5 py-2 active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <GripVertical
          size={14}
          aria-hidden
          className="shrink-0 text-muted-foreground/60"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {convidado.nome}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {convidado.lugares} {convidado.lugares === 1 ? "lugar" : "lugares"}
            {convidado.lado ? ` · ${convidado.lado}` : ""}
          </p>
        </div>
      </div>
      <div className="mt-2">
        <SeletorMesa
          convidado={convidado}
          mesas={mesas}
          lotacao={lotacao}
          onMover={(mesaId) => onMover(convidado.id, mesaId)}
        />
      </div>
    </li>
  );
}

function EditarMesa({ mesa }: { mesa: MesaRow }) {
  const [estado, action, pendente] = useActionState(
    editarMesa.bind(null, mesa.id),
    undefined
  );
  return (
    <details className="group relative">
      <summary
        aria-label={`Editar ${mesa.nome}`}
        className="flex size-8 cursor-pointer list-none items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Pencil size={14} aria-hidden />
      </summary>
      <form
        action={action}
        className="absolute right-0 z-10 mt-2 flex w-60 flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-lg"
      >
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Nome
          <input
            name="nome"
            defaultValue={mesa.nome}
            required
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Lugares
          <input
            name="capacidade"
            type="number"
            min={1}
            max={40}
            defaultValue={mesa.capacidade}
            required
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>
        {estado?.erro && <p className="text-xs text-rosa">{estado.erro}</p>}
        <button
          type="submit"
          disabled={pendente}
          className="self-start rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
        >
          {pendente ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </details>
  );
}

export function MapaMesas({
  mesas,
  convidados,
}: {
  mesas: MesaRow[];
  convidados: ConvidadoMesa[];
}) {
  const [lista, aplicar] = useOptimistic(
    convidados,
    (atual, mov: { id: string; mesaId: Destino }) =>
      atual.map((c) => (c.id === mov.id ? { ...c, mesaId: mov.mesaId } : c))
  );
  const [, iniciarTransicao] = useTransition();
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<string | null>(null);

  const mesaIds = new Set(mesas.map((m) => m.id));
  const lotacao = new Map<string, number>();
  for (const c of lista) {
    if (c.mesaId && mesaIds.has(c.mesaId)) {
      lotacao.set(c.mesaId, (lotacao.get(c.mesaId) ?? 0) + c.lugares);
    }
  }
  const semMesa = lista.filter((c) => !c.mesaId || !mesaIds.has(c.mesaId));
  const pessoasSemMesa = semMesa.reduce((s, c) => s + c.lugares, 0);

  function mover(id: string, mesaId: Destino) {
    iniciarTransicao(async () => {
      aplicar({ id, mesaId });
      await moverConvidado(id, mesaId);
    });
  }

  function zona(destino: Destino, chave: string) {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (sobre !== chave) setSobre(chave);
      },
      onDragLeave: () => setSobre((atual) => (atual === chave ? null : atual)),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain") || arrastando;
        setSobre(null);
        setArrastando(null);
        if (id) mover(id, destino);
      },
    };
  }

  const destaque = (chave: string) =>
    sobre === chave ? "ring-2 ring-accent/50 bg-accent/5" : "";

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[18rem_1fr]">
      {/* Sem mesa */}
      <aside
        {...zona(null, "pool")}
        className={`rounded-2xl border border-border bg-card p-4 transition xl:sticky xl:top-6 ${destaque("pool")}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-foreground">Sem mesa</h2>
          <span className="rounded-full bg-sol/15 px-2.5 py-0.5 text-xs font-medium text-[#8a6a1f]">
            {pessoasSemMesa} {pessoasSemMesa === 1 ? "pessoa" : "pessoas"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Arraste para uma mesa ou escolha no seletor.
        </p>

        {semMesa.length > 0 ? (
          <ul className="mt-4 grid max-h-[32rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-1">
            {semMesa.map((c) => (
              <ChipConvidado
                key={c.id}
                convidado={c}
                mesas={mesas}
                lotacao={lotacao}
                onMover={mover}
                onArrastar={setArrastando}
              />
            ))}
          </ul>
        ) : (
          <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <UserRound size={22} aria-hidden className="text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {lista.length === 0
                ? "Quando alguém confirmar presença, aparece aqui."
                : "Todos os confirmados já têm mesa."}
            </p>
          </div>
        )}
      </aside>

      {/* Mesas */}
      <div className="grid gap-4 2xl:grid-cols-2">
        {mesas.map((mesa) => {
          const doConvidados = lista.filter((c) => c.mesaId === mesa.id);
          const ocupados = lotacao.get(mesa.id) ?? 0;
          const livres = mesa.capacidade - ocupados;
          const passou = livres < 0;
          const cheia = livres === 0;

          return (
            <section
              key={mesa.id}
              {...zona(mesa.id, mesa.id)}
              className={`rounded-2xl border bg-card p-4 transition ${
                passou ? "border-rosa/40" : "border-border"
              } ${destaque(mesa.id)}`}
            >
              <div className="flex items-start gap-3">
                <Assentos capacidade={mesa.capacidade} ocupados={ocupados} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-serif text-xl text-foreground">
                      {mesa.nome}
                    </h3>
                    <div className="flex shrink-0 items-center">
                      <EditarMesa mesa={mesa} />
                      <form
                        action={removerMesa.bind(null, mesa.id)}
                        onSubmit={(e) => {
                          if (
                            !window.confirm(
                              `Remover "${mesa.nome}"? Os convidados voltam para "Sem mesa".`
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <button
                          type="submit"
                          aria-label={`Remover ${mesa.nome}`}
                          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
                        >
                          <Trash2 size={14} aria-hidden />
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ocupados} de {mesa.capacidade} lugares
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      passou
                        ? "bg-rosa/10 text-rosa"
                        : cheia
                          ? "bg-verde/10 text-verde"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {passou
                      ? `Passou ${-livres} ${-livres === 1 ? "lugar" : "lugares"}`
                      : cheia
                        ? "Completa"
                        : `${livres} ${livres === 1 ? "lugar livre" : "lugares livres"}`}
                  </span>
                </div>
              </div>

              {doConvidados.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {doConvidados.map((c) => (
                    <ChipConvidado
                      key={c.id}
                      convidado={c}
                      mesas={mesas}
                      lotacao={lotacao}
                      onMover={mover}
                      onArrastar={setArrastando}
                    />
                  ))}
                </ul>
              ) : (
                <p className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
                  <UsersRound size={14} aria-hidden />
                  Solte convidados aqui.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
