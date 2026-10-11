import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ImprimirBotao } from "@/components/publico/ImprimirBotao";
import { buscarCasamentoPorSlug } from "@/lib/db/queries/casamentos";
import { listarCronograma } from "@/lib/db/queries/cronograma";
import { horarioCurto } from "@/lib/cronograma";
import { formatarData } from "@/lib/formatar";

export const metadata: Metadata = {
  title: "Cronograma do dia",
  robots: { index: false, follow: false },
};

export default async function PaginaCronogramaPublico(
  props: PageProps<"/[slug]/cronograma/[token]">
) {
  const { slug, token } = await props.params;
  const { responsavel } = (await props.searchParams) as {
    responsavel?: string;
  };

  const casamento = await buscarCasamentoPorSlug(slug);
  if (
    !casamento ||
    !casamento.cronograma_token ||
    casamento.cronograma_token !== token
  ) {
    notFound();
  }

  const todos = await listarCronograma(casamento.id);
  const responsaveis = [
    ...new Set(todos.map((i) => i.responsavel).filter((r): r is string => !!r)),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const itens = responsavel
    ? todos.filter((i) => i.responsavel === responsavel)
    : todos;

  const base = `/${slug}/cronograma/${token}`;
  const data = formatarData(casamento.data_casamento);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 print:max-w-none print:py-0">
      <header className="flex flex-col items-center text-center">
        <Logo tamanho="md" href={null} />
        <p className="mt-6 text-xs font-medium tracking-[0.2em] text-accent uppercase">
          Cronograma do dia
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground">
          {casamento.nome_parceiro_1}{" "}
          <em className="font-normal text-sol italic">&amp;</em>{" "}
          {casamento.nome_parceiro_2}
        </h1>
        {data && <p className="mt-2 text-muted-foreground">{data}</p>}
      </header>

      {responsaveis.length > 0 && (
        <nav
          aria-label="Filtrar por responsável"
          className="mt-8 flex flex-wrap justify-center gap-2 print:hidden"
        >
          <Link
            href={base}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              !responsavel
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-foreground/70 hover:text-foreground"
            }`}
          >
            Todos
          </Link>
          {responsaveis.map((r) => (
            <Link
              key={r}
              href={`${base}?responsavel=${encodeURIComponent(r)}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                responsavel === r
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-foreground/70 hover:text-foreground"
              }`}
            >
              {r}
            </Link>
          ))}
        </nav>
      )}

      <ol className="mt-8 flex flex-col">
        {itens.map((item) => (
          <li
            key={item.id}
            className="flex gap-5 border-t border-border py-4 first:border-t-0 print:break-inside-avoid"
          >
            <p className="w-16 shrink-0 font-serif text-2xl leading-tight text-accent">
              {horarioCurto(item.horario)}
            </p>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-foreground">{item.titulo}</h2>
              {item.descricao && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.descricao}
                </p>
              )}
              {(item.local || item.responsavel) && (
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/70">
                  {item.local && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={12} aria-hidden />
                      {item.local}
                    </span>
                  )}
                  {item.responsavel && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound size={12} aria-hidden />
                      {item.responsavel}
                    </span>
                  )}
                </p>
              )}
            </div>
          </li>
        ))}
        {itens.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma atividade para este filtro.
          </li>
        )}
      </ol>

      <div className="mt-10 flex justify-center print:hidden">
        <ImprimirBotao />
      </div>
    </main>
  );
}
