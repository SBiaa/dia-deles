"use client";

import { useActionState, useRef, useEffect } from "react";
import { criarCusto } from "@/app/painel/custos/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioNovoCusto() {
  const [estado, action, pendente] = useActionState(criarCusto, undefined);
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
      <div className="min-w-[140px] flex-1">
        <Campo
          label="Categoria"
          name="categoria"
          placeholder="Ex: Buffet"
          required
        />
      </div>
      <div className="min-w-[140px] flex-1">
        <Campo label="Fornecedor (opcional)" name="fornecedor" />
      </div>
      <div className="w-32">
        <Campo label="Valor previsto (opcional)" name="valor" />
      </div>
      <div className="min-w-[140px] flex-1">
        <Campo label="Observações (opcional)" name="observacoes" />
      </div>
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      <Botao type="submit" disabled={pendente}>
        {pendente ? "Adicionando..." : "Adicionar"}
      </Botao>
    </form>
  );
}
