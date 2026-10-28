"use client";

import { useActionState, useEffect, useRef } from "react";
import { abrirChamado } from "@/app/actions/suporte";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";

type Props = {
  /** Quando logado, nome/e-mail já são conhecidos. */
  nome?: string;
  email?: string;
};

export function FormularioChamado({ nome, email }: Props) {
  const [estado, action, pendente] = useActionState(abrirChamado, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const logado = !!email;

  useEffect(() => {
    if (estado?.sucesso) formRef.current?.reset();
  }, [estado]);

  const erros = estado?.camposInvalidos;

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      {!logado && (
        <>
          <Campo label="Seu nome" name="nome" required erro={erros?.nome} />
          <Campo
            label="Seu e-mail (para responder)"
            name="email"
            type="email"
            required
            erro={erros?.email}
          />
        </>
      )}
      {logado && <input type="hidden" name="nome" value={nome ?? ""} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipo" className="text-sm text-muted-foreground">
          O que aconteceu?
        </label>
        <select
          id="tipo"
          name="tipo"
          defaultValue="bug"
          className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
        >
          <option value="bug">Algo deu errado (erro / bug)</option>
          <option value="duvida">Tenho uma dúvida</option>
          <option value="sugestao">Quero sugerir uma melhoria</option>
          <option value="outro">Outro assunto (ex.: não consigo entrar)</option>
        </select>
        {erros?.tipo?.map((m) => (
          <p key={m} className="text-xs text-accent">
            {m}
          </p>
        ))}
      </div>

      <Campo
        label="Assunto"
        name="assunto"
        required
        placeholder="Ex.: Não consigo adicionar convidados"
        erro={erros?.assunto}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="texto" className="text-sm text-muted-foreground">
          Conte o que houve
        </label>
        <textarea
          id="texto"
          name="texto"
          rows={6}
          required
          placeholder="Em qual tela estava, o que clicou e o que apareceu. Se tiver mensagem de erro, copie aqui."
          className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
        />
        {erros?.texto?.map((m) => (
          <p key={m} className="text-xs text-accent">
            {m}
          </p>
        ))}
      </div>

      {/* Armadilha para robôs: pessoas não veem nem preenchem. */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      {estado?.sucesso && (
        <p className="text-sm text-emerald-700">{estado.sucesso}</p>
      )}

      <Botao type="submit" disabled={pendente} className="self-start">
        {pendente ? "Enviando..." : "Enviar para o suporte"}
      </Botao>
    </form>
  );
}
