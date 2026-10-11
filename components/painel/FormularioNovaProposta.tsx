"use client";

import { useActionState, useEffect, useRef } from "react";
import { FilePlus2 } from "lucide-react";
import { criarProposta } from "@/app/painel/orcamentos/actions";
import { Botao } from "@/components/ui/Botao";
import { CATEGORIAS_SUGERIDAS } from "@/lib/financeiro";

const classeCampo =
  "w-full min-w-0 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent";

export function FormularioNovaProposta({
  categoriasExistentes,
}: {
  categoriasExistentes: string[];
}) {
  const [estado, action, pendente] = useActionState(criarProposta, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pendente && !estado?.erro) formRef.current?.reset();
  }, [pendente, estado]);

  const sugestoes = [
    ...new Set([...categoriasExistentes, ...CATEGORIAS_SUGERIDAS]),
  ];

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <FilePlus2 size={18} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">Nova proposta</h2>
          <p className="text-xs text-muted-foreground">
            Cadastre cada orçamento recebido. Propostas da mesma categoria
            aparecem lado a lado.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Categoria
          <input
            name="categoria"
            list="categorias-proposta"
            required
            placeholder="Ex.: Buffet"
            className={classeCampo}
          />
          <datalist id="categorias-proposta">
            {sugestoes.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Fornecedor
          <input name="fornecedor" required className={classeCampo} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Valor total
          <input
            name="valor"
            inputMode="decimal"
            required
            placeholder="R$ 0,00"
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Validade da proposta
          <input type="date" name="validade" className={classeCampo} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
          Condições de pagamento
          <input
            name="condicoes"
            placeholder="Ex.: 30% de entrada e 6x sem juros"
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
          O que está incluso
          <input
            name="inclui"
            placeholder="Ex.: 5 horas, 2 fotógrafos, álbum"
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
          Contato
          <input
            name="contato"
            placeholder="Telefone, e-mail ou site"
            className={classeCampo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
          Observações
          <input name="observacoes" className={classeCampo} />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Salvando..." : "Adicionar proposta"}
        </Botao>
      </div>
    </form>
  );
}
