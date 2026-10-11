import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { EnvioFotos } from "@/components/publico/EnvioFotos";
import {
  buscarCasamentoPorGaleriaToken,
  listarFotosAprovadas,
} from "@/lib/db/queries/galeria";

export const metadata: Metadata = {
  title: "Galeria de fotos",
  robots: { index: false, follow: false },
};

export default async function PaginaGaleriaPublica(
  props: PageProps<"/[slug]/galeria/[token]">
) {
  const { slug, token } = await props.params;
  const casamento = await buscarCasamentoPorGaleriaToken(token);
  if (!casamento || casamento.slug !== slug) notFound();

  const fotos = await listarFotosAprovadas(casamento.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10">
      <header className="flex flex-col items-center text-center">
        <Logo tamanho="md" href={null} />
        <p className="mt-6 text-xs font-medium tracking-[0.2em] text-accent uppercase">
          Galeria de fotos
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground">
          {casamento.nome_parceiro_1}{" "}
          <em className="font-normal text-sol italic">&amp;</em>{" "}
          {casamento.nome_parceiro_2}
        </h1>
      </header>

      <div className="mx-auto mt-8 max-w-xl">
        <EnvioFotos token={token} moderada={casamento.galeria_moderada} />
      </div>

      <section className="mt-12">
        <h2 className="text-center font-serif text-2xl text-foreground">
          Momentos do dia
        </h2>
        {fotos.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            As primeiras fotos vão aparecer aqui. Seja o primeiro a enviar!
          </p>
        ) : (
          <ul className="mt-6 columns-2 gap-3 sm:columns-3">
            {fotos.map((foto) => (
              <li key={foto.id} className="mb-3 break-inside-avoid">
                <a href={foto.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto.url}
                    alt={`Foto de ${foto.nome_autor}`}
                    loading="lazy"
                    className="w-full rounded-xl"
                  />
                </a>
                <p className="mt-1 px-1 text-xs text-muted-foreground">
                  {foto.nome_autor}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
