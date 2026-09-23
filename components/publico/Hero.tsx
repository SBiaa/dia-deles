import { Contagem } from "./Contagem";
import type { CasamentoRow } from "@/lib/db/queries/casamentos";

function formatarData(data: string | null) {
  if (!data) return null;
  const [ano, mes, dia] = data.split("-");
  return `${dia}.${mes}.${ano}`;
}

export function Hero({ casamento }: { casamento: CasamentoRow }) {
  const dataFormatada = formatarData(casamento.data_casamento);
  const dataAlvo = casamento.cerimonia_data_hora ?? casamento.data_casamento;

  return (
    <section
      className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-20 text-center"
      style={
        casamento.foto_capa_url
          ? {
              backgroundImage: `linear-gradient(rgba(20,15,12,0.35), rgba(20,15,12,0.45)), url(${casamento.foto_capa_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "#fff",
            }
          : undefined
      }
    >
      <p className="text-sm uppercase tracking-[0.3em] opacity-80">
        {casamento.nome_parceiro_1} &amp; {casamento.nome_parceiro_2}
      </p>
      {dataFormatada && (
        <h1 className="font-serif text-4xl sm:text-6xl">{dataFormatada}</h1>
      )}

      {dataAlvo && (
        <div className="mt-4">
          <Contagem dataAlvo={dataAlvo} />
        </div>
      )}
    </section>
  );
}
