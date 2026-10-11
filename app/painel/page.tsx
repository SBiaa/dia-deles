import Link from "next/link";
import {
  ArrowRight,
  CalendarHeart,
  Check,
  CircleCheck,
  CircleHelp,
  CircleX,
  ExternalLink,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { listarConvidadosPorCasamento } from "@/lib/db/queries/convidados";
import { listarPresentesPainel } from "@/lib/db/queries/presentes";
import { listarTarefasPainel } from "@/lib/db/queries/tarefas";
import { calcularResumoConvidados } from "@/lib/convidados";
import { calcularResumoTarefas } from "@/lib/tarefas";
import { formatarData } from "@/lib/formatar";
import { publicar, despublicar } from "@/app/painel/site/actions";

const DIA_MS = 24 * 60 * 60 * 1000;

function diasAte(data: string | null): number | null {
  if (!data) return null;
  const alvo = Date.parse(`${data.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(alvo)) return null;
  const hoje = new Date();
  const hojeUtc = Date.UTC(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );
  return Math.round((alvo - hojeUtc) / DIA_MS);
}

function textoContagem(dias: number | null) {
  if (dias === null) return null;
  if (dias > 1) return { numero: String(dias), legenda: "dias para o grande dia" };
  if (dias === 1) return { numero: "1", legenda: "dia para o grande dia" };
  if (dias === 0) return { numero: "Hoje", legenda: "é o grande dia!" };
  return { numero: "💍", legenda: "vocês já se casaram" };
}

export default async function PaginaVisaoGeral() {
  const usuario = await exigirSessao();
  const casamento = await buscarCasamentoPorId(usuario.casamentoId);

  if (!casamento) {
    return <p className="text-muted-foreground">Casamento não encontrado.</p>;
  }

  const [convidados, presentes, tarefas] = await Promise.all([
    listarConvidadosPorCasamento(usuario.casamentoId),
    listarPresentesPainel(usuario.casamentoId),
    listarTarefasPainel(usuario.casamentoId),
  ]);
  const resumo = calcularResumoConvidados(convidados);
  const resumoTarefas = calcularResumoTarefas(tarefas);
  const contagem = textoContagem(diasAte(casamento.data_casamento));

  const passos = [
    {
      titulo: "Contar a história de vocês",
      detalhe: "Um texto curto que apresenta o casal.",
      href: "/painel/site",
      feito: Boolean(casamento.historia_texto?.trim()),
    },
    {
      titulo: "Informar local e horário",
      detalhe: "Cerimônia e recepção, com mapa.",
      href: "/painel/site",
      feito: Boolean(
        casamento.cerimonia_local_nome?.trim() ||
          casamento.recepcao_local_nome?.trim()
      ),
    },
    {
      titulo: "Adicionar convidados",
      detalhe: "Cada um recebe um link de convite pessoal.",
      href: "/painel/convidados",
      feito: convidados.length > 0,
    },
    {
      titulo: "Montar a lista de presentes",
      detalhe: "Opcional, mas quem quer presentear agradece.",
      href: "/painel/presentes",
      feito: presentes.length > 0,
    },
    {
      titulo: "Publicar o site",
      detalhe: "Quando estiver pronto, é só publicar.",
      href: "/painel/site",
      feito: casamento.publicado,
    },
  ];
  const feitos = passos.filter((p) => p.feito).length;
  const progresso = Math.round((feitos / passos.length) * 100);
  const proximo = passos.find((p) => !p.feito);

  const estatisticas: {
    rotulo: string;
    valor: number;
    icone: LucideIcon;
    cor: string;
  }[] = [
    {
      rotulo: "Confirmaram",
      valor: resumo.confirmados,
      icone: CircleCheck,
      cor: "bg-verde/10 text-verde",
    },
    {
      rotulo: "Pessoas no total",
      valor: resumo.totalPessoas,
      icone: UsersRound,
      cor: "bg-accent/10 text-accent",
    },
    {
      rotulo: "Aguardando resposta",
      valor: resumo.pendentes,
      icone: CircleHelp,
      cor: "bg-sol/15 text-[#8a6a1f]",
    },
    {
      rotulo: "Não vão",
      valor: resumo.recusados,
      icone: CircleX,
      cor: "bg-rosa/10 text-rosa",
    },
  ];

  const botaoHero =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-accent p-7 text-accent-foreground sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-sol/30 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 right-24 size-56 rounded-full bg-rosa/30 blur-3xl"
        />

        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-white/75">Olá, {usuario.name}</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              {casamento.nome_parceiro_1}{" "}
              <em className="font-normal text-sol italic">&amp;</em>{" "}
              {casamento.nome_parceiro_2}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/80">
              <CalendarHeart size={16} aria-hidden />
              {formatarData(casamento.data_casamento) ?? (
                <Link href="/painel/site" className="underline">
                  Defina a data do casamento
                </Link>
              )}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <form action={casamento.publicado ? despublicar : publicar}>
                <button
                  type="submit"
                  className={`${botaoHero} ${
                    casamento.publicado
                      ? "border border-white/40 text-white hover:bg-white/10"
                      : "bg-white text-accent hover:bg-white/90"
                  }`}
                >
                  {casamento.publicado ? "Despublicar" : "Publicar site"}
                </button>
              </form>
              <Link
                href={`/${casamento.slug}`}
                target="_blank"
                className={`${botaoHero} border border-white/40 text-white hover:bg-white/10`}
              >
                Ver meu site
                <ExternalLink size={15} aria-hidden />
              </Link>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  casamento.publicado
                    ? "bg-verde text-white"
                    : "bg-white/15 text-white/85"
                }`}
              >
                {casamento.publicado ? "No ar" : "Rascunho"}
              </span>
            </div>
          </div>

          {contagem && (
            <div className="shrink-0 rounded-2xl bg-white/10 px-7 py-5 text-center backdrop-blur-sm">
              <p className="font-serif text-6xl leading-none text-sol">
                {contagem.numero}
              </p>
              <p className="mt-2 text-sm text-white/80">{contagem.legenda}</p>
            </div>
          )}
        </div>
      </section>

      {/* Estatísticas */}
      <section
        aria-label="Resumo dos convidados"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {estatisticas.map((estatistica) => (
          <CartaoEstatistica key={estatistica.rotulo} {...estatistica} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Próximos passos */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl text-foreground">
                Próximos passos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {feitos === passos.length
                  ? "Tudo pronto. Agora é aproveitar."
                  : `${feitos} de ${passos.length} concluídos`}
              </p>
            </div>
            <span className="font-serif text-2xl text-sol">{progresso}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progresso}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-sol transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>

          <ul className="mt-5 flex flex-col gap-2">
            {passos.map((passo) => {
              const destaque = passo === proximo;
              return (
                <li key={passo.titulo}>
                  <Link
                    href={passo.href}
                    className={`group flex items-center gap-4 rounded-xl border p-4 transition ${
                      destaque
                        ? "border-accent/40 bg-accent/5"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                        passo.feito
                          ? "bg-verde text-white"
                          : "border-2 border-border text-transparent"
                      }`}
                    >
                      <Check size={16} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-medium ${
                          passo.feito
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {passo.titulo}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {passo.detalhe}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-6">
          <Link
            href="/painel/tarefas"
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-accent/40"
          >
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Checklist
            </p>
            {resumoTarefas.total === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Liste o que falta fazer até o grande dia.
              </p>
            ) : (
              <>
                <p className="mt-3 font-serif text-3xl text-foreground">
                  {resumoTarefas.concluidas}
                  <span className="text-muted-foreground">
                    {" "}
                    / {resumoTarefas.total}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  tarefas concluídas
                  {resumoTarefas.atrasadas > 0 && (
                    <span className="font-medium text-rosa">
                      {" "}
                      · {resumoTarefas.atrasadas} atrasada
                      {resumoTarefas.atrasadas > 1 ? "s" : ""}
                    </span>
                  )}
                </p>
              </>
            )}
          </Link>

          <Link
            href="/painel/convidados"
            className="rounded-2xl border border-border bg-sol-suave p-6 transition hover:border-sol"
          >
            <p className="font-serif text-xl text-foreground">
              Convide por WhatsApp
            </p>
            <p className="mt-2 text-sm text-foreground/70">
              Cada convidado recebe um link pessoal para confirmar presença.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
              Abrir convidados <ArrowRight size={15} aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
