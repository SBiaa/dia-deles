import { CalendarClock, Check } from "lucide-react";
import { marcarParcela } from "@/app/painel/custos/actions";
import { diasEntre, hojeIso } from "@/lib/datas";
import { formatarData, formatarPreco } from "@/lib/formatar";

export type ItemVencimento = {
  parcelaId: string;
  categoria: string;
  fornecedor: string | null;
  numero: number;
  total: number;
  valorCentavos: number;
  vencimento: string | null;
};

function rotuloPrazo(vencimento: string | null, hoje: string) {
  if (!vencimento) return { texto: "Sem data", classe: "bg-muted text-muted-foreground" };
  const dias = diasEntre(hoje, vencimento);
  if (dias < 0) {
    return {
      texto: `Venceu há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "dia" : "dias"}`,
      classe: "bg-rosa/10 text-rosa",
    };
  }
  if (dias === 0) return { texto: "Vence hoje", classe: "bg-rosa/10 text-rosa" };
  if (dias <= 7) {
    return { texto: `Em ${dias} ${dias === 1 ? "dia" : "dias"}`, classe: "bg-sol/15 text-[#8a6a1f]" };
  }
  return { texto: `Em ${dias} dias`, classe: "bg-muted text-muted-foreground" };
}

export function ProximosVencimentos({ itens }: { itens: ItemVencimento[] }) {
  if (itens.length === 0) return null;
  const hoje = hojeIso();
  const visiveis = itens.slice(0, 6);

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border p-5 sm:px-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-rosa/10 text-rosa">
          <CalendarClock size={20} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Próximos vencimentos
          </h2>
          <p className="text-xs text-muted-foreground">
            {itens.length > visiveis.length
              ? `Mostrando as ${visiveis.length} primeiras de ${itens.length} parcelas em aberto.`
              : `${itens.length} ${itens.length === 1 ? "parcela em aberto" : "parcelas em aberto"}.`}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {visiveis.map((item) => {
          const prazo = rotuloPrazo(item.vencimento, hoje);
          return (
            <li
              key={item.parcelaId}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:px-6"
            >
              <div className="w-36 shrink-0">
                <p className="font-medium text-foreground">
                  {formatarData(item.vencimento) ?? "—"}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${prazo.classe}`}
                >
                  {prazo.texto}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.categoria}
                  {item.fornecedor && (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {item.fornecedor}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Parcela {item.numero} de {item.total}
                </p>
              </div>
              <p className="font-serif text-lg text-foreground">
                {formatarPreco(item.valorCentavos)}
              </p>
              <form action={marcarParcela.bind(null, item.parcelaId)}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-verde/50 hover:bg-verde/10 hover:text-verde"
                >
                  <Check size={14} aria-hidden />
                  Marcar paga
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
