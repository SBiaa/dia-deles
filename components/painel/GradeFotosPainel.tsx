"use client";

import { useMemo, useState } from "react";
import { Check, Download, Trash2 } from "lucide-react";
import {
  aprovarFoto,
  aprovarTodas,
  removerFoto,
} from "@/app/painel/galeria/actions";
import type { FotoRow } from "@/lib/db/queries/galeria";

type Filtro = "pendentes" | "aprovadas" | "todas";

export function GradeFotosPainel({ fotos }: { fotos: FotoRow[] }) {
  const pendentes = fotos.filter((f) => f.status === "pendente").length;
  const [filtro, setFiltro] = useState<Filtro>(
    pendentes > 0 ? "pendentes" : "aprovadas"
  );

  const visiveis = useMemo(
    () =>
      fotos.filter((f) =>
        filtro === "todas"
          ? true
          : filtro === "pendentes"
            ? f.status === "pendente"
            : f.status === "aprovada"
      ),
    [fotos, filtro]
  );

  const abas: { id: Filtro; rotulo: string; total: number }[] = [
    { id: "pendentes", rotulo: "Aguardando", total: pendentes },
    {
      id: "aprovadas",
      rotulo: "Publicadas",
      total: fotos.length - pendentes,
    },
    { id: "todas", rotulo: "Todas", total: fotos.length },
  ];

  if (fotos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        As fotos enviadas pelos convidados vão aparecer aqui.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div role="tablist" aria-label="Filtrar fotos" className="flex flex-wrap gap-2">
          {abas.map(({ id, rotulo, total }) => {
            const ativo = filtro === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setFiltro(id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  ativo
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-foreground/70 hover:text-foreground"
                }`}
              >
                {rotulo}{" "}
                <span className={ativo ? "text-white/70" : "text-muted-foreground"}>
                  {total}
                </span>
              </button>
            );
          })}
        </div>
        {pendentes > 0 && (
          <form action={aprovarTodas}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 hover:border-verde/50 hover:text-verde"
            >
              <Check size={15} aria-hidden />
              Aprovar todas ({pendentes})
            </button>
          </form>
        )}
      </div>

      {visiveis.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">
          Nada por aqui.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-4">
          {visiveis.map((foto) => (
            <li
              key={foto.id}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              <a href={foto.url} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.url}
                  alt={`Foto enviada por ${foto.nome_autor}`}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </a>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-foreground">
                  {foto.nome_autor}
                </p>
                <div className="mt-2 flex items-center justify-between gap-1">
                  {foto.status === "pendente" ? (
                    <form action={aprovarFoto.bind(null, foto.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-full bg-verde px-2.5 py-1 text-[11px] font-medium text-white hover:opacity-90"
                      >
                        <Check size={12} aria-hidden />
                        Aprovar
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-full bg-verde/10 px-2 py-0.5 text-[11px] font-medium text-verde">
                      Publicada
                    </span>
                  )}
                  <div className="flex items-center">
                    <a
                      href={foto.url}
                      download
                      aria-label="Baixar foto"
                      className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Download size={14} aria-hidden />
                    </a>
                    <form
                      action={removerFoto.bind(null, foto.id)}
                      onSubmit={(e) => {
                        if (!window.confirm("Remover esta foto da galeria?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <button
                        type="submit"
                        aria-label="Remover foto"
                        className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-rosa/10 hover:text-rosa"
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
