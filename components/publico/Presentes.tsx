import { CartaoPresente } from "./CartaoPresente";
import type { PresenteComReserva } from "@/lib/db/queries/presentes";

export function Presentes({
  presentes,
}: {
  presentes: PresenteComReserva[];
}) {
  if (presentes.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-center text-sm uppercase tracking-widest text-accent">
        Lista de presentes
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {presentes.map((presente) => (
          <CartaoPresente key={presente.id} presente={presente} />
        ))}
      </div>
    </section>
  );
}
