"use client";

import { useActionState, useEffect, useRef } from "react";
import { Botao } from "@/components/ui/Botao";

type Estado = { erro?: string; sucesso?: string } | undefined;

type Props = {
  /** Server action já com o id do chamado aplicado (bind). */
  acao: (estado: Estado, formData: FormData) => Promise<Estado>;
  rotuloBotao?: string;
};

export function FormularioResposta({ acao, rotuloBotao = "Enviar" }: Props) {
  const [estado, action, pendente] = useActionState(acao, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.sucesso) formRef.current?.reset();
  }, [estado]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <textarea
        name="texto"
        rows={4}
        required
        aria-label="Mensagem"
        className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
      />
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      {estado?.sucesso && (
        <p className="text-sm text-emerald-700">{estado.sucesso}</p>
      )}
      <Botao type="submit" disabled={pendente} className="self-start">
        {pendente ? "Enviando..." : rotuloBotao}
      </Botao>
    </form>
  );
}
