"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ExternalLink, Images, Link2 } from "lucide-react";
import {
  abrirGaleria,
  alternarModeracao,
  fecharGaleria,
} from "@/app/painel/galeria/actions";

export function ConfiguracaoGaleria({
  slug,
  token,
  moderada,
  qrSvg,
}: {
  slug: string;
  token: string | null;
  moderada: boolean;
  qrSvg: string | null;
}) {
  const [copiado, setCopiado] = useState(false);
  const [pendente, iniciar] = useTransition();
  const caminho = token ? `/${slug}/galeria/${token}` : null;

  async function copiar() {
    if (!caminho) return;
    const url = `${window.location.origin}${caminho}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  if (!caminho) {
    return (
      <section className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
          <Images size={26} aria-hidden />
        </span>
        <h2 className="mt-5 font-serif text-2xl text-foreground">
          Reúna as fotos de todos os convidados
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Abra a galeria e compartilhe o link ou o QR code. Os convidados enviam
          as fotos do celular e vocês escolhem o que aparece.
        </p>
        <form action={abrirGaleria} className="mt-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            <Link2 size={16} aria-hidden />
            Abrir galeria
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {qrSvg && (
          <div
            className="size-36 shrink-0 overflow-hidden rounded-xl border border-border bg-white p-1 [&>svg]:size-full"
            aria-label="QR code da galeria"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl text-foreground">
            Galeria aberta para envios
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compartilhe o link ou imprima o QR code em cartazes nas mesas.
            Qualquer pessoa com o link pode enviar fotos.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copiar}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              {copiado ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
            <a
              href={caminho}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 hover:border-accent/40 hover:text-accent"
            >
              <ExternalLink size={15} aria-hidden />
              Abrir página dos convidados
            </a>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={moderada}
              disabled={pendente}
              onChange={(e) => iniciar(() => alternarModeracao(e.target.checked))}
              className="mt-1 size-4 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">
                Aprovar fotos antes de publicar
              </span>
              <span className="block text-xs text-muted-foreground">
                {moderada
                  ? "Novas fotos ficam escondidas até vocês aprovarem."
                  : "Novas fotos aparecem na galeria na hora."}
              </span>
            </span>
          </label>

          <form
            action={fecharGaleria}
            onSubmit={(e) => {
              if (
                !window.confirm(
                  "Fechar a galeria? O link deixa de funcionar, mas as fotos continuam guardadas."
                )
              ) {
                e.preventDefault();
              }
            }}
            className="mt-4"
          >
            <button
              type="submit"
              className="text-xs text-muted-foreground underline hover:text-rosa"
            >
              Fechar galeria e desativar o link
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
