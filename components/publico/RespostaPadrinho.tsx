"use client";

import { useActionState, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  responderConvite,
  type EstadoRespostaPadrinho,
} from "@/app/[slug]/padrinhos/[token]/actions";

export function RespostaPadrinho({
  token,
  aceitouInicial,
  mensagemInicial,
}: {
  token: string;
  aceitouInicial: boolean | null;
  mensagemInicial: string | null;
}) {
  const [estado, action, pendente] = useActionState<
    EstadoRespostaPadrinho,
    FormData
  >(responderConvite.bind(null, token), undefined);
  const [editando, setEditando] = useState(aceitouInicial === null);
  const [escolha, setEscolha] = useState<"sim" | "nao">(
    aceitouInicial === false ? "nao" : "sim"
  );

  useEffect(() => {
    if (estado?.ok) setEditando(false);
  }, [estado]);

  const respondeu = aceitouInicial !== null || estado?.ok;
  const aceitou = estado?.ok ? escolha === "sim" : aceitouInicial;

  if (respondeu && !editando) {
    return (
      <div
        className={`rounded-2xl border p-5 text-center ${
          aceitou ? "border-verde/40 bg-verde/5" : "border-border bg-card"
        }`}
      >
        <Heart
          size={22}
          aria-hidden
          className={`mx-auto ${aceitou ? "text-verde" : "text-muted-foreground"}`}
        />
        <p className="mt-2 font-serif text-xl text-foreground">
          {aceitou
            ? "Que alegria ter você com a gente!"
            : "Obrigado por avisar. Vamos sentir sua falta."}
        </p>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="mt-2 text-sm text-accent underline"
        >
          Mudar resposta
        </button>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="font-serif text-xl text-foreground">
          Você aceita o convite?
        </legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
          <input
            type="radio"
            name="aceitou"
            value="sim"
            checked={escolha === "sim"}
            onChange={() => setEscolha("sim")}
            className="accent-[var(--accent)]"
          />
          Aceito, com muito carinho
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
          <input
            type="radio"
            name="aceitou"
            value="nao"
            checked={escolha === "nao"}
            onChange={() => setEscolha("nao")}
            className="accent-[var(--accent)]"
          />
          Infelizmente não poderei
        </label>
      </fieldset>

      <label className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
        Quer deixar um recado? (opcional)
        <textarea
          name="mensagem"
          rows={3}
          defaultValue={mensagemInicial ?? ""}
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>

      {estado?.erro && <p className="mt-3 text-sm text-rosa">{estado.erro}</p>}

      <button
        type="submit"
        disabled={pendente}
        className="mt-5 w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {pendente ? "Enviando..." : "Enviar resposta"}
      </button>
    </form>
  );
}
