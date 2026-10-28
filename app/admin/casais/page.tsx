import Link from "next/link";
import {
  POR_PAGINA,
  listarCasais,
  type FiltroCasais,
} from "@/lib/db/queries/admin";
import { formatarData, tempoAtras } from "@/lib/suporte";

const FILTROS: { valor: FiltroCasais; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ativos", rotulo: "Ativos (7 dias)" },
  { valor: "inativos", rotulo: "Inativos" },
  { valor: "sem_senha", rotulo: "Sem senha" },
];

function um(valor: string | string[] | undefined): string {
  return (Array.isArray(valor) ? valor[0] : valor) ?? "";
}

export default async function PaginaCasais(props: PageProps<"/admin/casais">) {
  const sp = await props.searchParams;
  const busca = um(sp.q).slice(0, 80);
  const filtro = (
    FILTROS.some((f) => f.valor === um(sp.filtro)) ? um(sp.filtro) : "todos"
  ) as FiltroCasais;
  const pagina = Math.max(1, Math.floor(Number(um(sp.pagina))) || 1);

  const { linhas, total } = await listarCasais({ busca, filtro, pagina });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const href = (
    extra: Record<string, string | number>,
    filtroAlvo: FiltroCasais = filtro
  ) => {
    const p = new URLSearchParams();
    if (busca) p.set("q", busca);
    if (filtroAlvo !== "todos") p.set("filtro", filtroAlvo);
    for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
    const qs = p.toString();
    return `/admin/casais${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Casais</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} {total === 1 ? "casal" : "casais"} encontrados.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={busca}
          placeholder="Buscar por nome, e-mail ou endereço do site"
          className="min-w-64 flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
        {filtro !== "todos" && <input type="hidden" name="filtro" value={filtro} />}
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={href({}, f.valor)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              f.valor === filtro
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-card text-foreground/75 hover:text-foreground"
            }`}
          >
            {f.rotulo}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-normal">Casal</th>
              <th className="px-4 py-3 font-normal">E-mail</th>
              <th className="px-4 py-3 font-normal">Cadastro</th>
              <th className="px-4 py-3 font-normal">Último acesso</th>
              <th className="px-4 py-3 text-right font-normal">Convidados</th>
              <th className="px-4 py-3 font-normal">Situação</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum casal encontrado.
                </td>
              </tr>
            )}
            {linhas.map((c) => (
              <tr key={c.usuario_id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/casais/${c.usuario_id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {c.nome_parceiro_1} &amp; {c.nome_parceiro_2}
                  </Link>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </td>
                <td className="px-4 py-3 text-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatarData(c.criado_em)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {tempoAtras(c.ultimo_acesso_em)}
                </td>
                <td className="px-4 py-3 text-right">{c.convidados}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {!c.tem_senha && (
                      <span className="rounded-full bg-sol-suave px-2 py-0.5 text-xs">
                        sem senha
                      </span>
                    )}
                    {c.publicado && (
                      <span className="rounded-full bg-verde/10 px-2 py-0.5 text-xs text-verde">
                        publicado
                      </span>
                    )}
                    {c.chamados_abertos > 0 && (
                      <span className="rounded-full bg-rosa/10 px-2 py-0.5 text-xs text-rosa">
                        {c.chamados_abertos} chamado(s)
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          {pagina > 1 ? (
            <Link href={href({ pagina: pagina - 1 })} className="text-accent underline">
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas ? (
            <Link href={href({ pagina: pagina + 1 })} className="text-accent underline">
              Próxima →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
