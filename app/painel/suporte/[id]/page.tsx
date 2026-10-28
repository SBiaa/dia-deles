import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { buscarChamado, listarMensagens } from "@/lib/db/queries/suporte";
import { responderComoCasal } from "@/app/actions/suporte";
import { ConversaChamado } from "@/components/suporte/ConversaChamado";
import { EtiquetaStatus } from "@/components/suporte/EtiquetaStatus";
import { FormularioResposta } from "@/components/suporte/FormularioResposta";
import { ROTULO_TIPO } from "@/lib/suporte";

export default async function PaginaChamado(
  props: PageProps<"/painel/suporte/[id]">
) {
  const usuario = await exigirSessao();
  const { id } = await props.params;
  const chamado = await buscarChamado(id);
  if (!chamado || chamado.usuario_id !== usuario.id) notFound();

  const mensagens = await listarMensagens(id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/painel/suporte"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} aria-hidden /> Voltar
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">
            {chamado.assunto}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ROTULO_TIPO[chamado.tipo]}
          </p>
        </div>
        <EtiquetaStatus status={chamado.status} />
      </div>

      <ConversaChamado
        mensagens={mensagens}
        visao="casal"
        nomeCasal={usuario.name ?? "Você"}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">
          {chamado.status === "resolvido"
            ? "Resolvido. Se ainda precisar, responda e reabrimos."
            : "Responder"}
        </h2>
        <FormularioResposta
          acao={responderComoCasal.bind(null, id)}
          rotuloBotao="Enviar resposta"
        />
      </section>
    </div>
  );
}
