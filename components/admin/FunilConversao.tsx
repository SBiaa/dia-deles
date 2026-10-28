type Etapa = { rotulo: string; valor: number; dica?: string };

export function FunilConversao({ etapas }: { etapas: Etapa[] }) {
  const base = Math.max(1, etapas[0]?.valor ?? 1);

  return (
    <ol className="flex flex-col gap-3">
      {etapas.map((e, i) => {
        const pctBase = Math.round((e.valor / base) * 100);
        const anterior = i > 0 ? etapas[i - 1].valor : null;
        const pctAnterior =
          anterior && anterior > 0 ? Math.round((e.valor / anterior) * 100) : null;
        return (
          <li key={e.rotulo}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-foreground">{e.rotulo}</span>
              <span className="text-muted-foreground">
                <strong className="font-medium text-foreground">{e.valor}</strong>
                {pctAnterior !== null && ` · ${pctAnterior}% da etapa anterior`}
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, pctBase)}%` }}
              />
            </div>
            {e.dica && (
              <p className="mt-1 text-xs text-muted-foreground">{e.dica}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
