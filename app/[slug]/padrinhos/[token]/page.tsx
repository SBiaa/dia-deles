import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarHeart, Clock, ExternalLink, MapPin } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { RespostaPadrinho } from "@/components/publico/RespostaPadrinho";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { buscarPadrinhoPorToken, listarManual } from "@/lib/db/queries/padrinhos";
import { horarioCurto } from "@/lib/cronograma";
import { MENSAGEM_PADRAO } from "@/lib/padrinhos";
import { formatarData } from "@/lib/formatar";

export const metadata: Metadata = {
  title: "Convite para o cortejo",
  robots: { index: false, follow: false },
};

function dataHoraBr(valor: string | null): string | null {
  if (!valor) return null;
  const [data, hora] = valor.split(/[T ]/);
  const d = formatarData(data);
  return d ? `${d}${hora ? ` às ${hora.slice(0, 5)}` : ""}` : null;
}

export default async function PaginaPadrinho(
  props: PageProps<"/[slug]/padrinhos/[token]">
) {
  const { slug, token } = await props.params;
  const padrinho = await buscarPadrinhoPorToken(token);
  if (!padrinho) notFound();

  const casamento = await buscarCasamentoPorId(padrinho.casamento_id);
  if (!casamento || casamento.slug !== slug) notFound();

  const manual =
    padrinho.aceitou === true ? await listarManual(casamento.id) : [];
  const dataCerimonia = dataHoraBr(casamento.cerimonia_data_hora);
  const dataCasamento = formatarData(casamento.data_casamento);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10">
      <header className="flex flex-col items-center text-center">
        <Logo tamanho="md" href={null} />
        <p className="mt-6 text-xs font-medium tracking-[0.2em] text-accent uppercase">
          Convite para o cortejo
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground">
          {casamento.nome_parceiro_1}{" "}
          <em className="font-normal text-sol italic">&amp;</em>{" "}
          {casamento.nome_parceiro_2}
        </h1>
        {dataCasamento && (
          <p className="mt-2 flex items-center gap-2 text-muted-foreground">
            <CalendarHeart size={16} aria-hidden />
            {dataCasamento}
          </p>
        )}
      </header>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
        <p className="text-sm text-muted-foreground">Olá,</p>
        <p className="font-serif text-3xl text-foreground">{padrinho.nome}</p>
        <span className="mt-3 inline-block rounded-full bg-sol-suave px-3.5 py-1 text-sm font-medium text-accent">
          {padrinho.papel}
        </span>
        <p className="mx-auto mt-5 max-w-md text-foreground/80">
          {casamento.padrinhos_mensagem ?? MENSAGEM_PADRAO}
        </p>
        {padrinho.nota_pessoal && (
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-muted px-4 py-3 text-sm italic text-foreground/80">
            “{padrinho.nota_pessoal}”
          </p>
        )}
      </section>

      <div className="mt-6">
        <RespostaPadrinho
          token={token}
          aceitouInicial={padrinho.aceitou}
          mensagemInicial={padrinho.resposta_mensagem}
        />
      </div>

      {padrinho.aceitou === true && (
        <>
          <section className="mt-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-2xl text-foreground">
              Informações do dia
            </h2>
            <dl className="mt-4 flex flex-col gap-4">
              {padrinho.horario_chegada && (
                <div className="flex items-start gap-3">
                  <Clock size={18} aria-hidden className="mt-0.5 text-accent" />
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Seu horário de chegada
                    </dt>
                    <dd className="font-serif text-2xl text-foreground">
                      {horarioCurto(padrinho.horario_chegada)}
                    </dd>
                  </div>
                </div>
              )}
              {(casamento.cerimonia_local_nome || dataCerimonia) && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} aria-hidden className="mt-0.5 text-accent" />
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Cerimônia
                    </dt>
                    <dd className="text-foreground">
                      {casamento.cerimonia_local_nome}
                      {casamento.cerimonia_endereco && (
                        <span className="block text-sm text-muted-foreground">
                          {casamento.cerimonia_endereco}
                        </span>
                      )}
                      {dataCerimonia && (
                        <span className="block text-sm text-muted-foreground">
                          {dataCerimonia}
                        </span>
                      )}
                      {casamento.cerimonia_mapa_url && (
                        <a
                          href={casamento.cerimonia_mapa_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1.5 text-sm text-accent underline"
                        >
                          Ver no mapa
                          <ExternalLink size={13} aria-hidden />
                        </a>
                      )}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
            {casamento.cronograma_token && (
              <Link
                href={`/${slug}/cronograma/${casamento.cronograma_token}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 hover:border-accent/40 hover:text-accent"
              >
                Ver o cronograma do dia
              </Link>
            )}
          </section>

          {manual.length > 0 && (
            <section className="mt-6">
              <h2 className="font-serif text-2xl text-foreground">
                Manual dos padrinhos
              </h2>
              <ol className="mt-4 flex flex-col gap-3">
                {manual.map((s, i) => (
                  <li
                    key={s.id}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sol/20 text-xs font-medium text-[#8a6a1f]">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {s.titulo}
                        </h3>
                        <p className="mt-1 whitespace-pre-line text-sm text-foreground/75">
                          {s.texto}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </main>
  );
}
