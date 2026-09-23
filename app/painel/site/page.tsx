import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { FormularioSite } from "@/components/painel/FormularioSite";

export default async function PaginaEditarSite() {
  const usuario = await exigirSessao();
  const casamento = await buscarCasamentoPorId(usuario.casamentoId);

  if (!casamento) {
    return <p className="text-muted-foreground">Casamento não encontrado.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl text-foreground">Meu site</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Essas informações aparecem na página pública em /{casamento.slug}.
      </p>

      <div className="mt-8">
        <FormularioSite casamento={casamento} />
      </div>
    </div>
  );
}
