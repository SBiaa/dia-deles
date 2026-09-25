import { exigirSessao } from "@/lib/dal";
import { listarConvidadosPorCasamento } from "@/lib/db/queries/convidados";
import { calcularResumoConvidados } from "@/lib/convidados";
import { FormularioNovoConvidado } from "@/components/painel/FormularioNovoConvidado";
import { ListaConvidados } from "@/components/painel/ListaConvidados";

export default async function PaginaConvidados() {
  const usuario = await exigirSessao();
  const convidados = await listarConvidadosPorCasamento(usuario.casamentoId);
  const resumo = calcularResumoConvidados(convidados);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-foreground">Convidados</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cada convidado tem um link próprio para confirmar presença.
      </p>

      <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{resumo.confirmados}</strong>{" "}
          confirmaram
        </span>
        <span>
          <strong className="text-foreground">{resumo.totalPessoas}</strong>{" "}
          pessoas no total
        </span>
        <span>
          <strong className="text-foreground">{resumo.pendentes}</strong>{" "}
          pendentes
        </span>
        <span>
          <strong className="text-foreground">{resumo.recusados}</strong> não
          vão
        </span>
      </div>

      <div className="mt-6">
        <FormularioNovoConvidado />
      </div>

      <ListaConvidados convidados={convidados} slug={usuario.slug} />
    </div>
  );
}
