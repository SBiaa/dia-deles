"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { criarMesas } from "@/app/painel/mesas/actions";
import { Botao } from "@/components/ui/Botao";

const classeCampo =
  "w-full min-w-0 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent";

export function FormularioNovaMesa() {
  const [estado, action, pendente] = useActionState(criarMesas, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pendente && !estado?.erro) formRef.current?.reset();
  }, [pendente, estado]);

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Plus size={18} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">Adicionar mesas</h2>
          <p className="text-xs text-muted-foreground">
            Crie uma mesa ou várias de uma vez, com o mesmo número de lugares.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Nome (opcional)
          <input
            name="nome"
            placeholder="Ex.: Família da noiva"
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Lugares por mesa
          <input
            name="capacidade"
            type="number"
            min={1}
            max={40}
            defaultValue={8}
            required
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Quantidade
          <input
            name="quantidade"
            type="number"
            min={1}
            max={40}
            defaultValue={1}
            required
            className={classeCampo}
          />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Criando..." : "Adicionar mesas"}
        </Botao>
      </div>
    </form>
  );
}
