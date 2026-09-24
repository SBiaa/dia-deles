import Link from "next/link";
import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { Botao } from "@/components/ui/Botao";
import { publicar, despublicar } from "@/app/painel/site/actions";

export default async function PaginaVisaoGeral() {
  const usuario = await exigirSessao();
  const casamento = await buscarCasamentoPorId(usuario.casamentoId);

  if (!casamento) {
    return <p className="text-muted-foreground">Casamento não encontrado.</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">
          Olá, {usuario.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {casamento.nome_parceiro_1} &amp; {casamento.nome_parceiro_2}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Seu site está em</p>
        <Link
          href={`/${casamento.slug}`}
          target="_blank"
          className="mt-1 block font-serif text-lg text-accent underline"
        >
          /{casamento.slug}
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              casamento.publicado
                ? "bg-accent/10 text-accent"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {casamento.publicado ? "Publicado" : "Rascunho (só você vê)"}
          </span>

          <form action={casamento.publicado ? despublicar : publicar}>
            <Botao type="submit" className="!bg-transparent !text-accent border border-accent">
              {casamento.publicado ? "Despublicar" : "Publicar site"}
            </Botao>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/painel/site"
          className="rounded-2xl border border-border bg-card p-5 hover:border-accent"
        >
          <p className="font-serif text-lg text-foreground">Meu site</p>
          <p className="mt-1 text-sm text-muted-foreground">
            História, cerimônia e recepção
          </p>
        </Link>
        <Link
          href="/painel/convidados"
          className="rounded-2xl border border-border bg-card p-5 hover:border-accent"
        >
          <p className="font-serif text-lg text-foreground">Convidados</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista e links de convite
          </p>
        </Link>
        <Link
          href="/painel/presentes"
          className="rounded-2xl border border-border bg-card p-5 hover:border-accent"
        >
          <p className="font-serif text-lg text-foreground">Presentes</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista de presentes
          </p>
        </Link>
      </div>
    </div>
  );
}
