"use client";

import { Gift, HandHeart, Trash2, Undo2 } from "lucide-react";
import { arquivarPresente, liberarReserva } from "@/app/painel/presentes/actions";
import { formatarPreco } from "@/lib/formatar";
import type { PresenteComReserva } from "@/lib/db/queries/presentes";

function CartaoPresente({ presente }: { presente: PresenteComReserva }) {
  const reservado = presente.reserva !== null;
  const preco = formatarPreco(presente.preco_centavos);

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(20,38,45,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
            reservado ? "bg-sol/15 text-[#8a6a1f]" : "bg-accent/10 text-accent"
          }`}
        >
          <Gift size={22} aria-hidden />
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            reservado ? "bg-sol/15 text-[#8a6a1f]" : "bg-verde/10 text-verde"
          }`}
        >
          {reservado ? "Reservado" : "Disponível"}
        </span>
      </div>

      <h3 className="mt-4 font-serif text-xl leading-snug text-foreground">
        {presente.nome}
      </h3>
      {presente.descricao && (
        <p className="mt-1 text-sm text-muted-foreground">
          {presente.descricao}
        </p>
      )}
      {preco && (
        <p className="mt-3 font-serif text-2xl text-accent">{preco}</p>
      )}

      {presente.reserva && (
        <div className="mt-4 rounded-xl bg-sol-suave p-3.5">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <HandHeart size={15} aria-hidden className="text-rosa" />
            {presente.reserva.nome_convidado}
          </p>
          {presente.reserva.mensagem && (
            <p className="mt-1.5 text-sm italic text-foreground/70">
              “{presente.reserva.mensagem}”
            </p>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        {presente.reserva ? (
          <form action={liberarReserva.bind(null, presente.reserva.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
            >
              <Undo2 size={14} aria-hidden />
              Liberar reserva
            </button>
          </form>
        ) : (
          <span />
        )}
        <form
          action={arquivarPresente.bind(null, presente.id)}
          onSubmit={(e) => {
            if (!window.confirm(`Remover "${presente.nome}" da lista?`)) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            aria-label={`Remover ${presente.nome}`}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
          >
            <Trash2 size={15} aria-hidden />
          </button>
        </form>
      </div>
    </li>
  );
}

export function ListaPresentesPainel({
  presentes,
}: {
  presentes: PresenteComReserva[];
}) {
  if (presentes.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-sol-suave text-accent">
          <Gift size={26} aria-hidden />
        </span>
        <h2 className="mt-5 font-serif text-2xl text-foreground">
          Nenhum presente por aqui ainda
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Adicione o primeiro presente acima. Quem quiser presentear escolhe um
          item da lista e marca &quot;vou presentear&quot;.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {presentes.map((presente) => (
        <CartaoPresente key={presente.id} presente={presente} />
      ))}
    </ul>
  );
}
