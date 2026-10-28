"use client";

import { useActionState } from "react";
import { corrigirEmail } from "@/app/admin/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioEmailAdmin({
  usuarioId,
  emailAtual,
}: {
  usuarioId: string;
  emailAtual: string;
}) {
  const [estado, action, pendente] = useActionState(
    corrigirEmail.bind(null, usuarioId),
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <Campo
        label="E-mail da conta"
        name="email"
        type="email"
        required
        defaultValue={emailAtual}
      />
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      {estado?.sucesso && (
        <p className="text-sm text-emerald-700">{estado.sucesso}</p>
      )}
      <Botao type="submit" disabled={pendente} className="self-start">
        {pendente ? "Salvando..." : "Corrigir e-mail"}
      </Botao>
    </form>
  );
}
