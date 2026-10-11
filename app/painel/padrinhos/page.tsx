import { CircleCheck, CircleHelp, CircleX, UsersRound } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { listarManual, listarPadrinhos } from "@/lib/db/queries/padrinhos";
import { MENSAGEM_PADRAO } from "@/lib/padrinhos";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { FormularioNovoPadrinho } from "@/components/painel/FormularioNovoPadrinho";
import { ListaPadrinhos } from "@/components/painel/ListaPadrinhos";
import {
  EditorManualPadrinhos,
  FormularioMensagemPadrinhos,
} from "@/components/painel/EditorManualPadrinhos";

export default async function PaginaPadrinhos() {
  const usuario = await exigirSessao();
  const [casamento, padrinhos, secoes] = await Promise.all([
    buscarCasamentoPorId(usuario.casamentoId),
    listarPadrinhos(usuario.casamentoId),
    listarManual(usuario.casamentoId),
  ]);
  if (!casamento) {
    return <p className="text-muted-foreground">Casamento não encontrado.</p>;
  }

  const aceitaram = padrinhos.filter((p) => p.aceitou === true).length;
  const recusaram = padrinhos.filter((p) => p.aceitou === false).length;
  const aguardando = padrinhos.filter((p) => p.aceitou === null).length;
  const mensagem = casamento.padrinhos_mensagem ?? MENSAGEM_PADRAO;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">
          Padrinhos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Convide padrinhos, madrinhas e cortejo com um link pessoal e entregue
          o manual com tudo que eles precisam saber.
        </p>
      </header>

      <section
        aria-label="Resumo"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <CartaoEstatistica
          rotulo="No cortejo"
          valor={padrinhos.length}
          icone={UsersRound}
          cor="bg-accent/10 text-accent"
        />
        <CartaoEstatistica
          rotulo="Aceitaram"
          valor={aceitaram}
          icone={CircleCheck}
          cor="bg-verde/10 text-verde"
        />
        <CartaoEstatistica
          rotulo="Aguardando"
          valor={aguardando}
          icone={CircleHelp}
          cor="bg-sol/15 text-[#8a6a1f]"
        />
        <CartaoEstatistica
          rotulo="Não poderão"
          valor={recusaram}
          icone={CircleX}
          cor="bg-rosa/10 text-rosa"
        />
      </section>

      <FormularioNovoPadrinho />

      <ListaPadrinhos
        padrinhos={padrinhos}
        slug={casamento.slug}
        mensagem={mensagem}
      />

      <FormularioMensagemPadrinhos
        mensagemAtual={casamento.padrinhos_mensagem}
        mensagemPadrao={MENSAGEM_PADRAO}
      />

      <EditorManualPadrinhos secoes={secoes} />
    </div>
  );
}
