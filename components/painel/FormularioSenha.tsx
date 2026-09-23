"use client";

import { useActionState, useRef, useEffect } from "react";
import { trocarSenha } from "@/app/painel/configuracoes/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioSenha() {
  const [estado, action, pendente] = useActionState(trocarSenha, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.sucesso) {
      formRef.current?.reset();
    }
  }, [estado]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <Campo label="Senha atual" name="senhaAtual" type="password" required />
      <Campo label="Nova senha" name="senhaNova" type="password" required />
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      {estado?.sucesso && (
        <p className="text-sm text-emerald-700">{estado.sucesso}</p>
      )}
      <Botao type="submit" disabled={pendente} className="self-start">
        {pendente ? "Salvando..." : "Trocar senha"}
      </Botao>
    </form>
  );
}
