"use client";

import { useActionState, useRef, useEffect } from "react";
import { criarTarefa } from "@/app/painel/tarefas/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioNovaTarefa() {
  const [estado, action, pendente] = useActionState(criarTarefa, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pendente && !estado?.erro) {
      formRef.current?.reset();
    }
  }, [pendente, estado]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3"
    >
      <div className="min-w-[160px] flex-1">
        <Campo
          label="O que precisa ser feito"
          name="titulo"
          placeholder="Ex: Fechar o buffet"
          required
        />
      </div>
      <div className="min-w-[140px] flex-1">
        <Campo label="Detalhes (opcional)" name="descricao" />
      </div>
      <div className="w-40">
        <Campo label="Prazo (opcional)" name="prazo" type="date" />
      </div>
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      <Botao type="submit" disabled={pendente}>
        {pendente ? "Adicionando..." : "Adicionar"}
      </Botao>
    </form>
  );
}
