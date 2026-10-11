import {
  CircleHelp,
  LayoutGrid,
  Armchair,
  UsersRound,
} from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { listarMesas } from "@/lib/db/queries/mesas";
import { listarConvidadosPorCasamento } from "@/lib/db/queries/convidados";
import { calcularResumoConvidados } from "@/lib/convidados";
import { convidadosParaMesas } from "@/lib/mesas";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { FormularioNovaMesa } from "@/components/painel/FormularioNovaMesa";
import { AcoesMesas } from "@/components/painel/AcoesMesas";
import { MapaMesas } from "@/components/painel/MapaMesas";

export default async function PaginaMesas() {
  const usuario = await exigirSessao();
  const [mesas, convidados] = await Promise.all([
    listarMesas(usuario.casamentoId),
    listarConvidadosPorCasamento(usuario.casamentoId),
  ]);

  const confirmados = convidadosParaMesas(convidados);
  const resumo = calcularResumoConvidados(convidados);
  const ids = new Set(mesas.map((m) => m.id));

  const lugaresTotais = mesas.reduce((s, m) => s + m.capacidade, 0);
  const pessoasConfirmadas = confirmados.reduce((s, c) => s + c.lugares, 0);
  const pessoasSentadas = confirmados
    .filter((c) => c.mesaId && ids.has(c.mesaId))
    .reduce((s, c) => s + c.lugares, 0);
  const temSemMesa = confirmados.some((c) => !c.mesaId || !ids.has(c.mesaId));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Mapa de mesas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Acomode quem confirmou presença. Cada convidado ocupa um lugar, mais
            um por acompanhante.
          </p>
        </div>
        {mesas.length > 0 && (
          <AcoesMesas
            podeDistribuir={temSemMesa}
            temAtribuidos={pessoasSentadas > 0}
          />
        )}
      </header>

      <section
        aria-label="Resumo"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <CartaoEstatistica
          rotulo="Mesas"
          valor={mesas.length}
          icone={LayoutGrid}
          cor="bg-accent/10 text-accent"
        />
        <CartaoEstatistica
          rotulo="Lugares disponíveis"
          valor={lugaresTotais}
          icone={Armchair}
          cor="bg-sol/15 text-[#8a6a1f]"
        />
        <CartaoEstatistica
          rotulo={`Sentados de ${pessoasConfirmadas}`}
          valor={pessoasSentadas}
          icone={UsersRound}
          cor="bg-verde/10 text-verde"
        />
        <CartaoEstatistica
          rotulo="Ainda sem resposta"
          valor={resumo.pendentes}
          icone={CircleHelp}
          cor="bg-rosa/10 text-rosa"
        />
      </section>

      <FormularioNovaMesa />

      {mesas.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
            <LayoutGrid size={26} aria-hidden />
          </span>
          <h2 className="mt-5 font-serif text-2xl text-foreground">
            Monte o salão
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Crie as mesas acima e depois arraste os convidados confirmados para
            elas, ou deixe que a gente distribua automaticamente.
          </p>
        </div>
      ) : (
        <MapaMesas mesas={mesas} convidados={confirmados} />
      )}
    </div>
  );
}
