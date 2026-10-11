import { BadgeCheck, FileStack, Layers, Wallet } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { listarPropostas } from "@/lib/db/queries/propostas";
import { listarOrcamentos } from "@/lib/db/queries/orcamentos";
import { hojeIso } from "@/lib/datas";
import { formatarPreco } from "@/lib/formatar";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { FormularioNovaProposta } from "@/components/painel/FormularioNovaProposta";
import {
  ComparadorPropostas,
  type GrupoCategoria,
} from "@/components/painel/ComparadorPropostas";

export default async function PaginaOrcamentos() {
  const usuario = await exigirSessao();
  const [propostas, orcamentos] = await Promise.all([
    listarPropostas(usuario.casamentoId),
    listarOrcamentos(usuario.casamentoId),
  ]);

  const orcamentoPorChave = new Map(
    orcamentos.map((o) => [o.categoria_chave, o.valor_centavos])
  );

  const grupos: GrupoCategoria[] = [];
  for (const p of propostas) {
    let grupo = grupos.find((g) => g.chave === p.categoria_chave);
    if (!grupo) {
      grupo = {
        chave: p.categoria_chave,
        categoria: p.categoria,
        orcamentoCentavos: orcamentoPorChave.get(p.categoria_chave) ?? null,
        propostas: [],
      };
      grupos.push(grupo);
    }
    grupo.propostas.push(p);
  }

  const escolhidas = propostas.filter((p) => p.escolhida);
  const valorEscolhidas = escolhidas.reduce((s, p) => s + p.valor_centavos, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">
          Comparador de orçamentos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Compare propostas de fornecedores lado a lado. Ao escolher uma, ela
          vira um custo no Financeiro.
        </p>
      </header>

      <section
        aria-label="Resumo"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <CartaoEstatistica
          rotulo="Propostas"
          valor={propostas.length}
          icone={FileStack}
          cor="bg-accent/10 text-accent"
        />
        <CartaoEstatistica
          rotulo="Categorias em cotação"
          valor={grupos.length}
          icone={Layers}
          cor="bg-sol/15 text-[#8a6a1f]"
        />
        <CartaoEstatistica
          rotulo="Fornecedores escolhidos"
          valor={escolhidas.length}
          icone={BadgeCheck}
          cor="bg-verde/10 text-verde"
        />
        <CartaoEstatistica
          rotulo="Valor contratado"
          valor={formatarPreco(valorEscolhidas) ?? "R$ 0,00"}
          icone={Wallet}
          cor="bg-rosa/10 text-rosa"
        />
      </section>

      <FormularioNovaProposta
        categoriasExistentes={grupos.map((g) => g.categoria)}
      />

      {grupos.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
            <FileStack size={26} aria-hidden />
          </span>
          <h2 className="mt-5 font-serif text-2xl text-foreground">
            Nenhuma proposta ainda
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Cadastre as propostas que vocês receberem, por exemplo três
            orçamentos de buffet, e veja qual compensa mais.
          </p>
        </div>
      ) : (
        <ComparadorPropostas grupos={grupos} hoje={hojeIso()} />
      )}
    </div>
  );
}
