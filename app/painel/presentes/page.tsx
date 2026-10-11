import { CircleCheck, Gift, PackageOpen, Wallet } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { listarPresentesPainel } from "@/lib/db/queries/presentes";
import { formatarPreco } from "@/lib/formatar";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { FormularioNovoPresente } from "@/components/painel/FormularioNovoPresente";
import { ListaPresentesPainel } from "@/components/painel/ListaPresentesPainel";

export default async function PaginaPresentes() {
  const usuario = await exigirSessao();
  const presentes = await listarPresentesPainel(usuario.casamentoId);

  const reservados = presentes.filter((p) => p.reserva).length;
  const totalCentavos = presentes.reduce(
    (soma, p) => soma + (p.preco_centavos ?? 0),
    0
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">
          Lista de presentes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Os convidados marcam &quot;vou presentear&quot;, sem cobrança pela
          ferramenta.
        </p>
      </header>

      <section
        aria-label="Resumo"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <CartaoEstatistica
          rotulo="Presentes na lista"
          valor={presentes.length}
          icone={Gift}
          cor="bg-accent/10 text-accent"
        />
        <CartaoEstatistica
          rotulo="Reservados"
          valor={reservados}
          icone={CircleCheck}
          cor="bg-verde/10 text-verde"
        />
        <CartaoEstatistica
          rotulo="Disponíveis"
          valor={presentes.length - reservados}
          icone={PackageOpen}
          cor="bg-sol/15 text-[#8a6a1f]"
        />
        <CartaoEstatistica
          rotulo="Valor da lista"
          valor={formatarPreco(totalCentavos) ?? "R$ 0,00"}
          icone={Wallet}
          cor="bg-rosa/10 text-rosa"
        />
      </section>

      <FormularioNovoPresente />

      <ListaPresentesPainel presentes={presentes} />
    </div>
  );
}
