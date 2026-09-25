"use client";

import { useActionState, useRef, useEffect } from "react";
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
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-end sm:gap-3"
    >
      <div className="flex-1">
        <Campo label="Nome (ou grupo/família)" name="nome" required />
      </div>
      <div className="w-40">
        <label htmlFor="lado" className="text-sm text-muted-foreground">
          Lado (opcional)
        </label>
        <select
          id="lado"
          name="lado"
          defaultValue=""
          className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        >
          <option value="">—</option>
          <option value="noiva">Noiva</option>
          <option value="noivo">Noivo</option>
        </select>
      </div>
      <div className="w-48">
        <Campo
          label="WhatsApp (opcional)"
          name="telefone"
          type="tel"
          placeholder="(11) 91234-5678"
        />
      </div>
      <div className="w-40">
        <Campo
          label="Acompanhantes permitidos"
          name="limiteAcompanhantes"
          type="number"
          defaultValue="0"
        />
      </div>
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      <Botao type="submit" disabled={pendente}>
        {pendente ? "Adicionando..." : "Adicionar"}
      </Botao>
    </form>
  );
}
