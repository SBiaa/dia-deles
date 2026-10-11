"use client";

import { useActionState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { criarItem } from "@/app/painel/cronograma/actions";
import { Botao } from "@/components/ui/Botao";

const classeCampo =
  "w-full min-w-0 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent";

export function FormularioNovoItemCronograma() {
  const [estado, action, pendente] = useActionState(criarItem, undefined);
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
          <Clock size={18} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Adicionar atividade
          </h2>
          <p className="text-xs text-muted-foreground">
            Cada item aparece em ordem de horário.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[8rem_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Horário
          <input type="time" name="horario" required className={classeCampo} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Atividade
          <input
            name="titulo"
            required
            placeholder="Ex.: Entrada dos noivos"
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Local (opcional)
          <input name="local" className={classeCampo} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Responsável (opcional)
          <input name="responsavel" className={classeCampo} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2 lg:col-span-4">
          Detalhes (opcional)
          <input name="descricao" className={classeCampo} />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar atividade"}
        </Botao>
      </div>
    </form>
  );
}
