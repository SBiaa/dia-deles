import { exigirSessao } from "@/lib/dal";
import { listarConvidadosPorCasamento } from "@/lib/db/queries/convidados";
import { FormularioNovoConvidado } from "@/components/painel/FormularioNovoConvidado";
import { ListaConvidados } from "@/components/painel/ListaConvidados";

export default async function PaginaConvidados() {
  const usuario = await exigirSessao();
  const convidados = await listarConvidadosPorCasamento(usuario.casamentoId);

  const confirmados = convidados.filter((c) => c.confirmado === true);
  const recusados = convidados.filter((c) => c.confirmado === false);
  const pendentes = convidados.filter((c) => c.confirmado === null);
  const totalPessoas = confirmados.reduce(
    (soma, c) => soma + 1 + c.numero_acompanhantes,
    0
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-foreground">Convidados</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cada convidado tem um link próprio para confirmar presença.
      </p>

      <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{confirmados.length}</strong>{" "}
          confirmaram
        </span>
        <span>
          <strong className="text-foreground">{totalPessoas}</strong> pessoas
          no total
        </span>
        <span>
          <strong className="text-foreground">{pendentes.length}</strong>{" "}
          pendentes
        </span>
        <span>
          <strong className="text-foreground">{recusados.length}</strong> não
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
