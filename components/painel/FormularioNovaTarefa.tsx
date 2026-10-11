"use client";

import { useActionState, useRef, useEffect } from "react";
import { ListPlus } from "lucide-react";
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
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <ListPlus size={18} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">Nova tarefa</h2>
          <p className="text-xs text-muted-foreground">
            Defina um prazo para ser avisado quando atrasar.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.4fr_0.8fr]">
        <Campo
          label="O que precisa ser feito"
          name="titulo"
          placeholder="Ex.: Fechar o buffet"
          required
        />
        <Campo label="Detalhes (opcional)" name="descricao" />
        <Campo label="Prazo (opcional)" name="prazo" type="date" />
      </div>

      <div className="mt-5 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar tarefa"}
        </Botao>
      </div>
    </form>
  );
}
