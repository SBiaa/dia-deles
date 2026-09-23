import { arquivarPresente, liberarReserva } from "@/app/painel/presentes/actions";
import { formatarPreco } from "@/lib/formatar";
import type { PresenteComReserva } from "@/lib/db/queries/presentes";

export function ListaPresentesPainel({
  presentes,
}: {
  presentes: PresenteComReserva[];
}) {
  if (presentes.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">
        Você ainda não adicionou nenhum presente.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {presentes.map((presente) => (
        <div
          key={presente.id}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-serif text-lg text-foreground">
              {presente.nome}
            </p>
            {presente.descricao && (
              <p className="text-sm text-muted-foreground">
                {presente.descricao}
              </p>
            )}
            {presente.preco_centavos !== null && (
              <p className="mt-1 text-sm text-accent">
                {formatarPreco(presente.preco_centavos)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {presente.reserva ? (
              <div className="text-right">
                <p className="text-sm text-foreground">
                  Reservado por {presente.reserva.nome_convidado}
                </p>
                <form action={liberarReserva.bind(null, presente.reserva.id)}>
                  <button
                    type="submit"
                    className="text-xs text-accent underline"
                  >
                    Liberar reserva
                  </button>
                </form>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Disponível
              </span>
            )}

            <form action={arquivarPresente.bind(null, presente.id)}>
              <button
                type="submit"
                className="text-xs text-muted-foreground underline"
              >
                Remover
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
