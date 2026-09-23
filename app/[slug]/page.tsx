import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { buscarCasamentoPorSlug } from "@/lib/db/queries/casamentos";
import { listarPresentesPublico } from "@/lib/db/queries/presentes";
import { Hero } from "@/components/publico/Hero";
import { Historia } from "@/components/publico/Historia";
import { Detalhes } from "@/components/publico/Detalhes";
import { Presentes } from "@/components/publico/Presentes";
import { FormularioRsvp } from "@/components/publico/FormularioRsvp";

export default async function PaginaPublicaCasamento(
  props: PageProps<"/[slug]">
) {
  const { slug } = await props.params;
  const casamento = await buscarCasamentoPorSlug(slug);

  if (!casamento) {
    notFound();
  }

  if (!casamento.publicado) {
    const session = await auth();
    const ehDono = session?.user?.casamentoId === casamento.id;
    if (!ehDono) {
      notFound();
    }
  }

  const presentes = await listarPresentesPublico(casamento.id);

  return (
    <main className="flex flex-1 flex-col">
      {!casamento.publicado && (
        <div className="bg-accent px-6 py-2 text-center text-sm text-accent-foreground">
          Este site ainda não foi publicado — só você está vendo esta prévia.
        </div>
      )}
      <Hero casamento={casamento} />
      <Historia casamento={casamento} />
      <Detalhes casamento={casamento} />
      <Presentes presentes={presentes} />

      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-center text-sm uppercase tracking-widest text-accent">
          Confirme sua presença
        </p>
        <div className="mt-6">
          <FormularioRsvp casamentoId={casamento.id} />
        </div>
      </section>
    </main>
  );
}
