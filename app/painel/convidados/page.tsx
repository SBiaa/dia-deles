import { CircleCheck, CircleHelp, CircleX, UsersRound } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { listarConvidadosPorCasamento } from "@/lib/db/queries/convidados";
import { calcularResumoConvidados } from "@/lib/convidados";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { FormularioNovoConvidado } from "@/components/painel/FormularioNovoConvidado";
import { ListaConvidados } from "@/components/painel/ListaConvidados";

export default async function PaginaConvidados() {
  const usuario = await exigirSessao();
  const convidados = await listarConvidadosPorCasamento(usuario.casamentoId);
  const resumo = calcularResumoConvidados(convidados);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">
          Convidados
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cada convidado tem um link próprio para confirmar presença.
        </p>
      </header>

      <section
        aria-label="Resumo"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <CartaoEstatistica
          rotulo="Confirmaram"
          valor={resumo.confirmados}
          icone={CircleCheck}
          cor="bg-verde/10 text-verde"
        />
        <CartaoEstatistica
          rotulo="Pessoas no total"
          valor={resumo.totalPessoas}
          icone={UsersRound}
          cor="bg-accent/10 text-accent"
        />
        <CartaoEstatistica
          rotulo="Aguardando resposta"
          valor={resumo.pendentes}
          icone={CircleHelp}
          cor="bg-sol/15 text-[#8a6a1f]"
        />
        <CartaoEstatistica
          rotulo="Não vão"
          valor={resumo.recusados}
          icone={CircleX}
          cor="bg-rosa/10 text-rosa"
        />
      </section>

      <FormularioNovoConvidado />

      <ListaConvidados convidados={convidados} slug={usuario.slug} />
    </div>
  );
}
