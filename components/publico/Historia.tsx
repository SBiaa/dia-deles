import type { CasamentoRow } from "@/lib/db/queries/casamentos";

export function Historia({ casamento }: { casamento: CasamentoRow }) {
  if (!casamento.historia_texto) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-widest text-accent">
        Nossa história
      </p>
      {casamento.historia_titulo && (
        <h2 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl">
          {casamento.historia_titulo}
        </h2>
      )}
      <p className="mt-6 whitespace-pre-line text-muted-foreground">
        {casamento.historia_texto}
      </p>
    </section>
  );
}
