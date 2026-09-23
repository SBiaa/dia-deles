"use client";

import { useActionState } from "react";
import { cadastrar } from "@/app/actions/auth";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioCadastro() {
  const [estado, action, pendente] = useActionState(cadastrar, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Campo
        label="Seu nome"
        name="nome"
        required
        autoFocus
        erro={estado?.camposInvalidos?.nome}
      />
      <Campo
        label="E-mail"
        name="email"
        type="email"
        required
        erro={estado?.camposInvalidos?.email}
      />
      <Campo
        label="Senha"
        name="senha"
        type="password"
        required
        erro={estado?.camposInvalidos?.senha}
      />

      <div className="mt-2 grid grid-cols-2 gap-4">
        <Campo
          label="Nome de um dos noivos"
          name="nomeParceiro1"
          required
          erro={estado?.camposInvalidos?.nomeParceiro1}
        />
        <Campo
          label="Nome do outro noivo"
          name="nomeParceiro2"
          required
          erro={estado?.camposInvalidos?.nomeParceiro2}
        />
      </div>

      <Campo
        label="Data do casamento (opcional)"
        name="dataCasamento"
        type="date"
        erro={estado?.camposInvalidos?.dataCasamento}
      />

      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}

      <Botao type="submit" disabled={pendente} className="mt-2">
        {pendente ? "Criando conta..." : "Criar meu site"}
      </Botao>
    </form>
  );
}
