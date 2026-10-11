import { CalendarClock } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { listarCronograma } from "@/lib/db/queries/cronograma";
import { formatarData } from "@/lib/formatar";
import { horaDaCerimonia } from "@/lib/cronograma";
import { BotaoRoteiroSugerido } from "@/components/painel/BotaoRoteiroSugerido";
import { CompartilharCronograma } from "@/components/painel/CompartilharCronograma";
import { FormularioNovoItemCronograma } from "@/components/painel/FormularioNovoItemCronograma";
import { ListaCronograma } from "@/components/painel/ListaCronograma";

export default async function PaginaCronograma() {
  const usuario = await exigirSessao();
  const [casamento, itens] = await Promise.all([
    buscarCasamentoPorId(usuario.casamentoId),
    listarCronograma(usuario.casamentoId),
  ]);
  if (!casamento) {
    return <p className="text-muted-foreground">Casamento não encontrado.</p>;
  }

  const token = casamento.cronograma_token;
  const data = formatarData(casamento.data_casamento);
  const hora = horaDaCerimonia(casamento.cerimonia_data_hora);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Cronograma do dia
          </h1>
          <p className="mt-2 text-muted-foreground">
            O roteiro hora a hora
            {data ? ` de ${data}` : ""}, para cerimonialista, fornecedores e
            família seguirem o mesmo plano.
          </p>
        </div>
        {itens.length > 0 && <BotaoRoteiroSugerido rotulo="Adicionar sugestões" />}
      </header>

      <CompartilharCronograma slug={casamento.slug} token={token} />

      <FormularioNovoItemCronograma />

      {itens.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
            <CalendarClock size={26} aria-hidden />
          </span>
          <h2 className="mt-5 font-serif text-2xl text-foreground">
            Comece com um roteiro pronto
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Montamos uma sugestão de preparativos, cerimônia e festa a partir
            do horário da cerimônia ({hora}). Depois é só ajustar.
          </p>
          <div className="mt-6">
            <BotaoRoteiroSugerido destaque />
          </div>
        </div>
      ) : (
        <ListaCronograma itens={itens} />
      )}
    </div>
  );
}
