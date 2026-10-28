"use client";

import { useActionState, useState } from "react";
import { gerarLinkRedefinicao } from "@/app/admin/actions";
import { Botao } from "@/components/ui/Botao";

export function BotaoRedefinirSenha({ usuarioId }: { usuarioId: string }) {
  const [estado, action, pendente] = useActionState(
    gerarLinkRedefinicao.bind(null, usuarioId),
    undefined
  );
  const [copiado, setCopiado] = useState(false);

  async function copiar(link: string) {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={action}>
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Gerando..." : "Gerar link para redefinir senha"}
        </Botao>
      </form>
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      {estado?.link && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            Vale por 2 dias. Envie para o casal (WhatsApp ou e-mail). Quem abrir
            o link define a senha e já entra.
          </p>
          <code className="break-all text-xs text-foreground">{estado.link}</code>
          <button
            type="button"
            onClick={() => copiar(estado.link!)}
            className="self-start text-sm font-medium text-accent hover:underline"
          >
            {copiado ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}
