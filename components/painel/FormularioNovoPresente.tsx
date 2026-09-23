"use client";

import { useActionState, useRef, useEffect } from "react";
import { criarPresente } from "@/app/painel/presentes/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioNovoPresente() {
  const [estado, action, pendente] = useActionState(criarPresente, undefined);
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
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-end sm:gap-3"
    >
      <div className="flex-1">
        <Campo label="Nome do presente" name="nome" required />
      </div>
      <div className="flex-1">
        <Campo label="Descrição (opcional)" name="descricao" />
      </div>
      <div className="w-32">
        <Campo label="Preço (opcional)" name="preco" />
      </div>
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      <Botao type="submit" disabled={pendente}>
        {pendente ? "Adicionando..." : "Adicionar"}
      </Botao>
    </form>
  );
}
