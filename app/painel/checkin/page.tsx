import Link from "next/link";
import { CircleCheck, Hourglass, Printer, UsersRound } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { listarConvidadosComMesa } from "@/lib/db/queries/convidados";
import { calcularResumoCheckin, pessoasEsperadas } from "@/lib/checkin";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import {
  CheckinPainel,
  type LinhaCheckin,
} from "@/components/painel/CheckinPainel";

export default async function PaginaCheckin() {
  const usuario = await exigirSessao();
  const convidados = await listarConvidadosComMesa(usuario.casamentoId);
  const resumo = calcularResumoCheckin(convidados);

  const linhas: LinhaCheckin[] = convidados
    .filter((c) => c.confirmado === true || c.checkin_em)
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      lado: c.lado,
      confirmado: c.confirmado,
      esperadas: pessoasEsperadas(c),
      chegou: !!c.checkin_em,
      pessoas: c.checkin_pessoas ?? pessoasEsperadas(c),
      mesa: c.mesa_nome,
      chegadaEm: c.checkin_em,
    }));

  const percentual =
    resumo.esperados > 0
      ? Math.min(100, Math.round((resumo.chegaram / resumo.esperados) * 100))
      : 0;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Check-in
          </h1>
          <p className="mt-2 text-muted-foreground">
            Registre a chegada dos convidados lendo o QR code do convite, e
            acompanhe quem já está no evento.
          </p>
        </div>
        <Link
          href="/painel/checkin/qrcodes"
          target="_blank"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-accent/40 hover:text-accent"
        >
          <Printer size={16} aria-hidden />
          Imprimir QR codes
        </Link>
      </header>

      <section aria-label="Resumo" className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <CartaoEstatistica
            rotulo="Chegaram"
            valor={resumo.chegaram}
            icone={CircleCheck}
            cor="bg-verde/10 text-verde"
          />
          <CartaoEstatistica
            rotulo="Esperados"
            valor={resumo.esperados}
            icone={UsersRound}
            cor="bg-accent/10 text-accent"
          />
          <CartaoEstatistica
            rotulo="Faltam chegar"
            valor={resumo.faltam}
            icone={Hourglass}
            cor="bg-sol/15 text-[#8a6a1f]"
          />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">
              {resumo.convidadosQueChegaram} de {resumo.convidadosEsperados}{" "}
              convites já passaram pela entrada
            </p>
            <p className="font-serif text-2xl text-sol">{percentual}%</p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percentual}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-sol transition-all"
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>
      </section>

      <CheckinPainel linhas={linhas} />
    </div>
  );
}
