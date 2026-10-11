"use client";

import { useActionState, useEffect, useRef } from "react";
import { UserPlus } from "lucide-react";
import { adicionarPadrinho } from "@/app/painel/padrinhos/actions";
import { Botao } from "@/components/ui/Botao";
import { PAPEIS_PADRINHO } from "@/lib/padrinhos";

const classeCampo =
  "w-full min-w-0 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent";

export function FormularioNovoPadrinho() {
  const [estado, action, pendente] = useActionState(adicionarPadrinho, undefined);
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
          <UserPlus size={18} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Adicionar padrinho ou madrinha
          </h2>
          <p className="text-xs text-muted-foreground">
            Cada pessoa recebe um link próprio, com convite e manual.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Nome
          <input name="nome" required className={classeCampo} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Papel
          <select name="papel" defaultValue="Padrinho" className={classeCampo}>
            {PAPEIS_PADRINHO.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          WhatsApp (opcional)
          <input
            name="telefone"
            type="tel"
            placeholder="(11) 91234-5678"
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Horário de chegada
          <input name="horarioChegada" type="time" className={classeCampo} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2 lg:col-span-4">
          Recado pessoal (opcional)
          <input
            name="notaPessoal"
            placeholder="Ex.: Você vai entrar com a Mariana. Ensaio às 16h."
            className={classeCampo}
          />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar"}
        </Botao>
      </div>
    </form>
  );
}
