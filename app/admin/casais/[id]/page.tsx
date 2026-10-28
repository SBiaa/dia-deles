import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { buscarDetalheCasal } from "@/lib/db/queries/admin";
import { listarChamadosDoUsuario } from "@/lib/db/queries/suporte";
import { ROTULO_TIPO, formatarData, formatarDataHora, tempoAtras } from "@/lib/suporte";
import { BotaoRedefinirSenha } from "@/components/admin/BotaoRedefinirSenha";
import { FormularioEmailAdmin } from "@/components/admin/FormularioEmailAdmin";
import { EtiquetaStatus } from "@/components/suporte/EtiquetaStatus";

export default async function PaginaCasalAdmin(
  props: PageProps<"/admin/casais/[id]">
) {
  const { id } = await props.params;
  const casal = await buscarDetalheCasal(id);
  if (!casal) notFound();

  const chamados = await listarChamadosDoUsuario(id);
  const tokenAtivo =
    casal.token_definir_senha &&
    casal.token_definir_senha_expira_em &&
    new Date(casal.token_definir_senha_expira_em) > new Date();

  const uso: [string, number][] = [
    ["Convidados", casal.convidados],
    ["Confirmações (RSVP)", casal.rsvps],
    ["Presentes", casal.presentes],
    ["Custos", casal.custos],
    ["Tarefas", casal.tarefas],
    ["Fotos na galeria", casal.fotos],
  ];

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/casais"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} aria-hidden /> Casais
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-foreground">
            {casal.nome_parceiro_1} &amp; {casal.nome_parceiro_2}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conta de {casal.nome} · {casal.email}
          </p>
        </div>
        <Link
          href={`/${casal.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          Ver site /{casal.slug}
          {!casal.publicado && " (não publicado)"}
          <ExternalLink size={14} aria-hidden />
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Cadastro", formatarData(casal.criado_em)],
          ["Último acesso", tempoAtras(casal.ultimo_acesso_em)],
          ["Dias com acesso (30d)", String(casal.acessos_30d)],
          ["Veio de", casal.origem ?? "não rastreado"],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{rotulo}</p>
            <p className="mt-1 font-serif text-xl text-foreground">{valor}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-foreground">Ajudar com a conta</h2>
          <p className="text-sm text-muted-foreground">
            Situação da senha:{" "}
            <b className="text-foreground">
              {casal.tem_senha ? "definida" : "ainda não definida"}
            </b>
            {tokenAtivo &&
              ` · há um link ativo até ${formatarDataHora(casal.token_definir_senha_expira_em!)}`}
          </p>
          <BotaoRedefinirSenha usuarioId={casal.usuario_id} />
          <hr className="border-border" />
          <FormularioEmailAdmin
            usuarioId={casal.usuario_id}
            emailAtual={casal.email}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-foreground">O que já cadastraram</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {uso.map(([rotulo, valor]) => (
              <div key={rotulo} className="rounded-xl bg-muted px-4 py-3">
                <dt className="text-xs text-muted-foreground">{rotulo}</dt>
                <dd className="font-serif text-xl text-foreground">{valor}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            Data do casamento:{" "}
            <b className="text-foreground">{formatarData(casal.data_casamento)}</b>
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg text-foreground">Chamados deste casal</h2>
        {chamados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum chamado.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {chamados.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/suporte/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition hover:border-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.assunto}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ROTULO_TIPO[c.tipo]} · {formatarData(c.criado_em)}
                    </p>
                  </div>
                  <EtiquetaStatus status={c.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
