"use client";

import { useActionState } from "react";
import { entrar } from "@/app/actions/auth";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioLogin() {
  const [estado, action, pendente] = useActionState(entrar, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Campo label="E-mail" name="email" type="email" required autoFocus />
      <Campo label="Senha" name="senha" type="password" required />

      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}

      <Botao type="submit" disabled={pendente} className="mt-2">
        {pendente ? "Entrando..." : "Entrar"}
      </Botao>
    </form>
  );
}
