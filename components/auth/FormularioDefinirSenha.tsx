"use client";

import { useActionState } from "react";
import { definirSenha } from "@/app/definir-senha/[token]/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioDefinirSenha({ token }: { token: string }) {
  const acaoComToken = definirSenha.bind(null, token);
  const [estado, action, pendente] = useActionState(acaoComToken, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Campo
        label="Crie sua senha"
        name="senha"
        type="password"
        required
        autoFocus
      />

      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}

      <Botao type="submit" disabled={pendente} className="mt-2">
        {pendente ? "Salvando..." : "Definir senha e entrar"}
      </Botao>
    </form>
  );
}
