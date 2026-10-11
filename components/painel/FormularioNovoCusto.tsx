"use client";

import { useActionState, useRef, useEffect } from "react";
import { Receipt } from "lucide-react";
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
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Receipt size={18} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Registrar custo
          </h2>
          <p className="text-xs text-muted-foreground">
            O valor pode ficar em branco até o orçamento sair.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Campo
          label="Categoria"
          name="categoria"
          placeholder="Ex.: Buffet"
          required
        />
        <Campo label="Fornecedor (opcional)" name="fornecedor" />
        <Campo
          label="Valor contratado (opcional)"
          name="valor"
          placeholder="R$ 0,00"
        />
        <Campo label="Observações (opcional)" name="observacoes" />
      </div>

      <div className="mt-5 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar custo"}
        </Botao>
      </div>
    </form>
  );
}
