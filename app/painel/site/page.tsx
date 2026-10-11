import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { FormularioSite } from "@/components/painel/FormularioSite";

export default async function PaginaEditarSite() {
  const usuario = await exigirSessao();
  const casamento = await buscarCasamentoPorId(usuario.casamentoId);

  if (!casamento) {
    return <p className="text-muted-foreground">Casamento não encontrado.</p>;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Meu site
          </h1>
          <p className="mt-2 text-muted-foreground">
            Essas informações aparecem na página pública dos convidados.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              casamento.publicado
                ? "bg-verde/10 text-verde"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {casamento.publicado ? "No ar" : "Rascunho"}
          </span>
          <Link
            href={`/${casamento.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-accent/40 hover:text-accent"
          >
            /{casamento.slug}
            <ExternalLink size={14} aria-hidden />
          </Link>
        </div>
      </header>

      <FormularioSite casamento={casamento} />
    </div>
  );
}
