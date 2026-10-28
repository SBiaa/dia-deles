import Link from "next/link";
import {
  Eye,
  Globe,
  HeartHandshake,
  LifeBuoy,
  MousePointerClick,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import {
  buscarFunil,
  buscarTotais,
  listarOrigens,
  listarUsoRecursos,
  serieAtivos,
  serieCadastros,
  serieVisitantes,
} from "@/lib/db/queries/admin";
import { contarChamadosPorStatus } from "@/lib/db/queries/suporte";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { GraficoBarras } from "@/components/admin/GraficoBarras";
import { FunilConversao } from "@/components/admin/FunilConversao";

const PERIODOS = [7, 30, 90];

function pct(parte: number, todo: number) {
  return todo > 0 ? `${Math.round((parte / todo) * 100)}%` : "—";
}

export default async function PaginaAdmin(props: PageProps<"/admin">) {
  const { dias: diasParam } = await props.searchParams;
  const pedido = Number(Array.isArray(diasParam) ? diasParam[0] : diasParam);
  const dias = PERIODOS.includes(pedido) ? pedido : 30;

  const [totais, funil, origens, recursos, cadastros, visitantes, ativos, chamados] =
    await Promise.all([
      buscarTotais(),
      buscarFunil(dias),
      listarOrigens(dias),
      listarUsoRecursos(),
      serieCadastros(dias),
      serieVisitantes(dias),
      serieAtivos(dias),
      contarChamadosPorStatus(),
    ]);

  const pendentesSuporte = chamados.aberto + chamados.em_andamento;
  const inativos = totais.com_senha - totais.ativos_30d;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Visão geral</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Como o Hera está crescendo e sendo usado.
          </p>
        </div>
        <div className="flex gap-2">
          {PERIODOS.map((p) => (
            <Link
              key={p}
              href={`/admin?dias=${p}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                p === dias
                  ? "bg-accent text-accent-foreground"
                  : "border border-border bg-card text-foreground/75 hover:text-foreground"
              }`}
            >
              {p} dias
            </Link>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoEstatistica
          rotulo="Casais cadastrados"
          valor={totais.casais}
          icone={Users}
          cor="bg-accent/10 text-accent"
        />
        <CartaoEstatistica
          rotulo={`Novos nos últimos ${dias} dias`}
          valor={cadastros.reduce((s, p) => s + p.valor, 0)}
          icone={UserPlus}
          cor="bg-verde/10 text-verde"
        />
        <CartaoEstatistica
          rotulo="Ativos (7 dias)"
          valor={totais.ativos_7d}
          icone={Zap}
          cor="bg-sol-suave text-sol"
        />
        <CartaoEstatistica
          rotulo="Ativos (30 dias)"
          valor={totais.ativos_30d}
          icone={MousePointerClick}
          cor="bg-accent/10 text-accent"
        />
        <CartaoEstatistica
          rotulo="Sites publicados"
          valor={totais.publicados}
          icone={Globe}
          cor="bg-verde/10 text-verde"
        />
        <CartaoEstatistica
          rotulo="Começaram a usar de verdade"
          valor={totais.ativados}
          icone={HeartHandshake}
          cor="bg-rosa/10 text-rosa"
        />
        <CartaoEstatistica
          rotulo="Cadastraram e sumiram"
          valor={totais.nunca_voltaram}
          icone={Eye}
          cor="bg-muted text-muted-foreground"
        />
        <Link href="/admin/suporte" className="block transition hover:opacity-90">
          <CartaoEstatistica
            rotulo="Chamados em aberto"
            valor={pendentesSuporte}
            icone={LifeBuoy}
            cor="bg-rosa/10 text-rosa"
          />
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <GraficoBarras
          titulo="Visitantes novos"
          descricao="Pessoas diferentes que abriram o site sem estar logadas"
          dados={visitantes}
          cor="bg-sol"
        />
        <GraficoBarras
          titulo="Cadastros"
          descricao="Casais que criaram conta"
          dados={cadastros}
          cor="bg-accent"
        />
        <GraficoBarras
          titulo="Casais ativos por dia"
          descricao="Casais que entraram no painel"
          dados={ativos}
          cor="bg-verde"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-foreground">
            Do visitante ao casal ativo
          </h2>
          <p className="mb-5 mt-0.5 text-xs text-muted-foreground">
            Últimos {dias} dias. Cada etapa mostra quantos passaram da anterior.
          </p>
          <FunilConversao
            etapas={[
              { rotulo: "Visitaram o site", valor: funil.visitantes },
              {
                rotulo: "Chegaram na tela de cadastro",
                valor: funil.viram_cadastro,
              },
              { rotulo: "Criaram conta", valor: funil.cadastros },
              { rotulo: "Definiram a senha", valor: funil.definiram_senha },
              {
                rotulo: "Começaram a montar o casamento",
                valor: funil.ativaram,
                dica: "Publicaram o site ou cadastraram convidados, presentes, custos, cronograma, mesas ou padrinhos.",
              },
              {
                rotulo: "Voltaram outro dia",
                valor: funil.voltaram,
              },
            ]}
          />
          <div className="mt-6 rounded-xl bg-muted p-4 text-sm text-foreground">
            <strong className="font-medium">{funil.so_olharam}</strong> visitantes
            abriram uma página e saíram sem se cadastrar (
            {pct(funil.so_olharam, funil.visitantes)} dos visitantes).
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Os números de visitantes começam a contar a partir do dia em que o
            rastreamento entrou no ar.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg text-foreground">
              De onde vêm os visitantes
            </h2>
            {origens.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Ainda sem dados no período.
              </p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-normal">Origem</th>
                    <th className="pb-2 text-right font-normal">Visitantes</th>
                    <th className="pb-2 text-right font-normal">Cadastros</th>
                    <th className="pb-2 text-right font-normal">Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {origens.map((o) => (
                    <tr key={o.origem} className="border-t border-border">
                      <td className="py-2 text-foreground">{o.origem}</td>
                      <td className="py-2 text-right">{o.visitantes}</td>
                      <td className="py-2 text-right">{o.cadastros}</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {pct(o.cadastros, o.visitantes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Dica: divulgue links com <code>?utm_source=instagram</code> (ou
              whatsapp, indicacao...) para separar cada canal.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg text-foreground">
              O que os casais mais usam
            </h2>
            <p className="mb-4 mt-0.5 text-xs text-muted-foreground">
              Quantos casais já usaram cada recurso.
            </p>
            <ul className="flex flex-col gap-2.5">
              {recursos.map((r) => (
                <li key={r.recurso}>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{r.recurso}</span>
                    <span className="text-muted-foreground">
                      {r.casais} ({pct(r.casais, totais.casais)})
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-verde"
                      style={{
                        width: `${
                          totais.casais > 0
                            ? Math.min(100, (r.casais / totais.casais) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <h2 className="font-serif text-lg text-foreground">Resumo da base</h2>
        <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
          <li>
            Contas com senha definida: <b className="text-foreground">{totais.com_senha}</b>
          </li>
          <li>
            Contas que nunca definiram a senha:{" "}
            <Link href="/admin/casais?filtro=sem_senha" className="font-medium text-accent underline">
              {totais.sem_senha}
            </Link>
          </li>
          <li>
            Sem acesso há mais de 30 dias:{" "}
            <Link href="/admin/casais?filtro=inativos" className="font-medium text-accent underline">
              {Math.max(0, inativos)}
            </Link>
          </li>
          <li>
            Convidados cadastrados no total:{" "}
            <b className="text-foreground">{totais.convidados}</b>
          </li>
          <li>
            Confirmações de presença recebidas:{" "}
            <b className="text-foreground">{totais.rsvps}</b>
          </li>
          <li>
            Novos nos últimos 7 dias:{" "}
            <b className="text-foreground">{totais.novos_7d}</b>
          </li>
        </ul>
      </section>
    </div>
  );
}
