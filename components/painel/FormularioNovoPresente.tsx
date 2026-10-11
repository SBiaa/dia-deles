"use client";

import { useActionState, useRef, useEffect } from "react";
import { Gift } from "lucide-react";
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
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Gift size={18} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Adicionar presente
          </h2>
          <p className="text-xs text-muted-foreground">
            Uma ideia, um item ou uma cota. Vocês decidem.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.6fr_0.8fr]">
        <Campo label="Nome do presente" name="nome" required />
        <Campo label="Descrição (opcional)" name="descricao" />
        <Campo label="Preço (opcional)" name="preco" placeholder="R$ 0,00" />
      </div>

      <div className="mt-5 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar presente"}
        </Botao>
      </div>
    </form>
  );
}
