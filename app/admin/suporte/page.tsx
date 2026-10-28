import Link from "next/link";
import {
  contarChamadosPorStatus,
  listarChamadosAdmin,
  type StatusChamado,
} from "@/lib/db/queries/suporte";
import { ROTULO_STATUS, ROTULO_TIPO, formatarDataHora } from "@/lib/suporte";
import { EtiquetaStatus } from "@/components/suporte/EtiquetaStatus";

type Filtro = StatusChamado | "todos";

export default async function PaginaSuporteAdmin(
  props: PageProps<"/admin/suporte">
) {
  const sp = await props.searchParams;
  const pedido = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const filtro: Filtro =
    pedido === "aberto" || pedido === "em_andamento" || pedido === "resolvido"
      ? pedido
      : "todos";

  const [chamados, contagem] = await Promise.all([
    listarChamadosAdmin(filtro),
    contarChamadosPorStatus(),
  ]);

  const abas: { valor: Filtro; rotulo: string; n?: number }[] = [
    { valor: "todos", rotulo: "Todos" },
    { valor: "aberto", rotulo: ROTULO_STATUS.aberto, n: contagem.aberto },
    {
      valor: "em_andamento",
      rotulo: ROTULO_STATUS.em_andamento,
      n: contagem.em_andamento,
    },
    { valor: "resolvido", rotulo: ROTULO_STATUS.resolvido, n: contagem.resolvido },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Suporte</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos de ajuda e relatos de erro enviados pelos casais.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {abas.map((a) => (
          <Link
            key={a.valor}
            href={a.valor === "todos" ? "/admin/suporte" : `/admin/suporte?status=${a.valor}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              a.valor === filtro
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-card text-foreground/75 hover:text-foreground"
            }`}
          >
            {a.rotulo}
            {a.n !== undefined && ` (${a.n})`}
          </Link>
        ))}
      </div>

      {chamados.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum chamado por aqui.
        </p>
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
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.nome} · {c.email} · {ROTULO_TIPO[c.tipo]} ·{" "}
                    {formatarDataHora(c.atualizado_em)}
                    {c.ultima_autor === "casal" && c.status !== "resolvido"
                      ? " · aguardando resposta"
                      : ""}
                    {!c.usuario_id ? " · sem conta" : ""}
                  </p>
                </div>
                <EtiquetaStatus status={c.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
