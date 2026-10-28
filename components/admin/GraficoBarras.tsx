import type { PontoSerie } from "@/lib/db/queries/admin";

type Props = {
  titulo: string;
  descricao?: string;
  dados: PontoSerie[];
  /** Classe de cor das barras, ex.: "bg-accent". */
  cor?: string;
};

function rotuloDia(dia: string) {
  const [, mes, d] = dia.split("-");
  return `${d}/${mes}`;
}

export function GraficoBarras({
  titulo,
  descricao,
  dados,
  cor = "bg-accent",
}: Props) {
  const total = dados.reduce((s, p) => s + p.valor, 0);
  const maximo = Math.max(1, ...dados.map((p) => p.valor));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-foreground">{titulo}</h3>
        <p className="font-serif text-2xl text-foreground">{total}</p>
      </div>
      {descricao && (
        <p className="mt-0.5 text-xs text-muted-foreground">{descricao}</p>
      )}

      <div
        className="mt-4 flex h-32 items-end gap-[2px]"
        role="img"
        aria-label={`${titulo}: ${total} no período`}
      >
        {dados.map((p) => (
          <div
            key={p.dia}
            title={`${rotuloDia(p.dia)}: ${p.valor}`}
            className="flex h-full flex-1 items-end"
          >
            <div
              className={`w-full rounded-t-sm ${cor} ${
                p.valor === 0 ? "opacity-15" : ""
              }`}
              style={{ height: `${Math.max(4, (p.valor / maximo) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{dados.length > 0 ? rotuloDia(dados[0].dia) : ""}</span>
        <span>pico: {maximo === 1 && total === 0 ? 0 : maximo}</span>
        <span>
          {dados.length > 0 ? rotuloDia(dados[dados.length - 1].dia) : ""}
        </span>
      </div>
    </div>
  );
}
