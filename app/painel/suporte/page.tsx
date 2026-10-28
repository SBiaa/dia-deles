import Link from "next/link";
import { exigirSessao } from "@/lib/dal";
import { listarChamadosDoUsuario } from "@/lib/db/queries/suporte";
import { ROTULO_TIPO, formatarData } from "@/lib/suporte";
import { FormularioChamado } from "@/components/suporte/FormularioChamado";
import { EtiquetaStatus } from "@/components/suporte/EtiquetaStatus";

export default async function PaginaSuporte() {
  const usuario = await exigirSessao();
  const chamados = await listarChamadosDoUsuario(usuario.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Ajuda e suporte</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Encontrou um erro, ficou com dúvida ou tem uma ideia? Escreva aqui que
          a gente responde por esta página.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg text-foreground">Novo pedido</h2>
        <div className="mt-4">
          <FormularioChamado
            nome={usuario.name ?? ""}
            email={usuario.email ?? ""}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg text-foreground">Seus pedidos</h2>
        {chamados.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não enviou nenhum pedido.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {chamados.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/painel/suporte/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition hover:border-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.assunto}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ROTULO_TIPO[c.tipo]} · {formatarData(c.criado_em)}
                      {c.ultima_autor === "admin" && c.status !== "resolvido"
                        ? " · nova resposta da equipe"
                        : ""}
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
