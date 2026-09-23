import { exigirSessao } from "@/lib/dal";
import { listarPresentesPainel } from "@/lib/db/queries/presentes";
import { FormularioNovoPresente } from "@/components/painel/FormularioNovoPresente";
import { ListaPresentesPainel } from "@/components/painel/ListaPresentesPainel";

export default async function PaginaPresentes() {
  const usuario = await exigirSessao();
  const presentes = await listarPresentesPainel(usuario.casamentoId);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl text-foreground">
        Lista de presentes
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Os convidados marcam &quot;vou presentear&quot; — sem cobrança pela
        ferramenta.
      </p>

      <div className="mt-6">
        <FormularioNovoPresente />
      </div>

      <ListaPresentesPainel presentes={presentes} />
    </div>
  );
}
