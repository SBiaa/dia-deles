import type { MensagemRow } from "@/lib/db/queries/suporte";
import { formatarDataHora } from "@/lib/suporte";

type Props = {
  mensagens: MensagemRow[];
  /** Quem está olhando: define qual lado aparece à direita. */
  visao: "casal" | "admin";
  nomeCasal: string;
};

export function ConversaChamado({ mensagens, visao, nomeCasal }: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {mensagens.map((m) => {
        const minha = m.autor === visao;
        const nome = m.autor === "admin" ? "Equipe Hera" : nomeCasal;
        return (
          <li
            key={m.id}
            className={`max-w-[85%] rounded-2xl border px-4 py-3 ${
              minha
                ? "self-end border-accent/20 bg-accent/5"
                : "self-start border-border bg-card"
            }`}
          >
            <p className="text-xs text-muted-foreground">
              {nome} · {formatarDataHora(m.criado_em)}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
              {m.texto}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
