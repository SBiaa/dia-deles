"use client";

import { useActionState } from "react";
import { trocarSlug } from "@/app/painel/configuracoes/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

export function FormularioSlug({ slugAtual }: { slugAtual: string }) {
  const [estado, action, pendente] = useActionState(trocarSlug, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <Campo label="Endereço do site" name="slug" defaultValue={slugAtual} required />
      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      {estado?.sucesso && (
        <p className="text-sm text-emerald-700">{estado.sucesso}</p>
      )}
      <Botao type="submit" disabled={pendente} className="self-start">
        {pendente ? "Salvando..." : "Salvar endereço"}
      </Botao>
    </form>
  );
}
