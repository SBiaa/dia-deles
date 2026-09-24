import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { buscarCasamentoPorSlug } from "@/lib/db/queries/casamentos";
import { buscarConvidadoPorCodigo } from "@/lib/db/queries/convidados";
import { listarPresentesPublico } from "@/lib/db/queries/presentes";
import { Hero } from "@/components/publico/Hero";
import { Historia } from "@/components/publico/Historia";
import { Detalhes } from "@/components/publico/Detalhes";
import { Presentes } from "@/components/publico/Presentes";
import { ConfirmacaoConvite } from "@/components/publico/ConfirmacaoConvite";

export default async function PaginaConvite(
  props: PageProps<"/[slug]/convite/[codigo]">
) {
  const { slug, codigo } = await props.params;
  const casamento = await buscarCasamentoPorSlug(slug);

  if (!casamento) {
    notFound();
  }

  const convidado = await buscarConvidadoPorCodigo(codigo);
  if (!convidado || convidado.casamento_id !== casamento.id) {
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

      <div className="bg-muted px-6 py-3 text-center text-sm text-foreground">
        Convite pessoal de <strong>{convidado.nome}</strong>
      </div>

      <Hero casamento={casamento} />
      <Historia casamento={casamento} />
      <Detalhes casamento={casamento} />
      <Presentes presentes={presentes} />

      <section className="mx-auto w-full max-w-lg px-6 py-16 text-center">
        <p className="text-sm uppercase tracking-widest text-accent">
          Confirme sua presença
        </p>
        <p className="mt-3 font-serif text-xl text-foreground">
          Olá, {convidado.nome}!{" "}
          {convidado.limite_acompanhantes > 0
            ? `Você e até ${convidado.limite_acompanhantes} acompanhante${convidado.limite_acompanhantes > 1 ? "s" : ""} estão convidados.`
            : "Você está convidado(a)."}
        </p>
        <div className="mt-6">
          <ConfirmacaoConvite convidado={convidado} />
        </div>
      </section>
    </main>
  );
}
