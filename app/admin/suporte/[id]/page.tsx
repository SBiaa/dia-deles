import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buscarChamado, listarMensagens } from "@/lib/db/queries/suporte";
import {
  alterarStatusChamado,
  responderComoAdmin,
} from "@/app/admin/actions";
import { ConversaChamado } from "@/components/suporte/ConversaChamado";
import { EtiquetaStatus } from "@/components/suporte/EtiquetaStatus";
import { FormularioResposta } from "@/components/suporte/FormularioResposta";
import { ROTULO_TIPO } from "@/lib/suporte";

export default async function PaginaChamadoAdmin(
  props: PageProps<"/admin/suporte/[id]">
) {
  const { id } = await props.params;
  const chamado = await buscarChamado(id);
  if (!chamado) notFound();
  const mensagens = await listarMensagens(id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/admin/suporte"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} aria-hidden /> Suporte
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">
            {chamado.assunto}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ROTULO_TIPO[chamado.tipo]} · {chamado.nome} ·{" "}
            <a className="text-accent underline" href={`mailto:${chamado.email}`}>
              {chamado.email}
            </a>
            {chamado.usuario_id ? (
              <>
                {" · "}
                <Link
                  href={`/admin/casais/${chamado.usuario_id}`}
                  className="text-accent underline"
                >
                  ver casal
                </Link>
              </>
            ) : (
              " · não tem conta logada (responda pelo e-mail)"
            )}
          </p>
          {chamado.navegador && (
            <p className="mt-1 break-all text-xs text-muted-foreground">
              Navegador: {chamado.navegador}
            </p>
          )}
        </div>
        <EtiquetaStatus status={chamado.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["aberto", "em_andamento", "resolvido"] as const).map((s) => (
          <form key={s} action={alterarStatusChamado.bind(null, id, s)}>
            <button
              type="submit"
              disabled={chamado.status === s}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground/80 transition hover:text-foreground disabled:bg-muted disabled:opacity-60"
            >
              Marcar como {s === "em_andamento" ? "em andamento" : s}
            </button>
          </form>
        ))}
      </div>

      <ConversaChamado
        mensagens={mensagens}
        visao="admin"
        nomeCasal={chamado.nome}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted-foreground">
          {chamado.usuario_id
            ? "Resposta (o casal vê em Ajuda e suporte, dentro do painel)"
            : "Resposta (guardada aqui; envie também por e-mail, pois a pessoa não tem conta)"}
        </h2>
        <FormularioResposta
          acao={responderComoAdmin.bind(null, id)}
          rotuloBotao="Enviar resposta"
        />
      </section>
    </div>
  );
}
