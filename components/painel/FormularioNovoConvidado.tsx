"use client";

import { useActionState, useRef, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { criarConvidado } from "@/app/painel/convidados/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioNovoConvidado() {
  const [estado, action, pendente] = useActionState(criarConvidado, undefined);
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
          <UserPlus size={18} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Adicionar convidado
          </h2>
          <p className="text-xs text-muted-foreground">
            Pode ser uma pessoa ou uma família inteira.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr]">
        <Campo label="Nome (ou grupo/família)" name="nome" required />
        <Campo
          label="WhatsApp (opcional)"
          name="telefone"
          type="tel"
          placeholder="(11) 91234-5678"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lado" className="text-sm text-muted-foreground">
            Lado (opcional)
          </label>
          <select
            id="lado"
            name="lado"
            defaultValue=""
            className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="">—</option>
            <option value="noiva">Noiva</option>
            <option value="noivo">Noivo</option>
          </select>
        </div>
        <Campo
          label="Acompanhantes"
          name="limiteAcompanhantes"
          type="number"
          defaultValue="0"
        />
      </div>

      <div className="mt-5 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar convidado"}
        </Botao>
      </div>
    </form>
  );
}
