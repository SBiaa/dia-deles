"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import {
  gerarLinkCronograma,
  revogarLinkCronograma,
} from "@/app/painel/cronograma/actions";

export function CompartilharCronograma({
  slug,
  token,
}: {
  slug: string;
  token: string | null;
}) {
  const [copiado, setCopiado] = useState(false);
  const caminho = token ? `/${slug}/cronograma/${token}` : null;

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

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-verde/10 text-verde">
            <Share2 size={20} aria-hidden />
          </span>
          <div>
            <h2 className="font-serif text-xl text-foreground">
              Compartilhar com cerimonialista e família
            </h2>
            <p className="text-xs text-muted-foreground">
              Um link só de leitura, que mostra sempre a versão mais recente e
              pode ser impresso.
            </p>
          </div>
        </div>

        {caminho ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copiar}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              {copiado ? (
                <Check size={15} aria-hidden />
              ) : (
                <Copy size={15} aria-hidden />
              )}
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
            <a
              href={caminho}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-accent/40 hover:text-accent"
            >
              <ExternalLink size={15} aria-hidden />
              Abrir
            </a>
            <form
              action={revogarLinkCronograma}
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    "Desativar o link? Quem já recebeu deixa de conseguir abrir."
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <button
                type="submit"
                className="rounded-full px-3 py-2 text-xs text-muted-foreground underline hover:text-rosa"
              >
                Desativar link
              </button>
            </form>
          </div>
        ) : (
          <form action={gerarLinkCronograma}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              <Link2 size={16} aria-hidden />
              Gerar link para compartilhar
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
