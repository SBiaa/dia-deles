"use client";

import { useActionState, useEffect, useRef } from "react";
import { BookOpen, Pencil, Sparkles, Trash2 } from "lucide-react";
import {
  adicionarSecao,
  editarSecao,
  gerarManualSugerido,
  removerSecao,
  salvarMensagem,
} from "@/app/painel/padrinhos/actions";
import type { SecaoManualRow } from "@/lib/db/queries/padrinhos";

const classeCampo =
  "w-full min-w-0 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent";

export function FormularioMensagemPadrinhos({
  mensagemAtual,
  mensagemPadrao,
}: {
  mensagemAtual: string | null;
  mensagemPadrao: string;
}) {
  const [estado, action, pendente] = useActionState(salvarMensagem, undefined);
  return (
    <form
      action={action}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <h2 className="font-serif text-xl text-foreground">Mensagem do convite</h2>
      <p className="text-xs text-muted-foreground">
        É o texto que aparece no topo do convite de cada padrinho e vai junto
        na mensagem de WhatsApp.
      </p>
      <textarea
        name="mensagem"
        rows={3}
        defaultValue={mensagemAtual ?? mensagemPadrao}
        className={`${classeCampo} mt-4`}
      />
      <div className="mt-3 flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <button
          type="submit"
          disabled={pendente}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pendente ? "Salvando..." : "Salvar mensagem"}
        </button>
      </div>
    </form>
  );
}

function EditarSecao({ secao }: { secao: SecaoManualRow }) {
  const [estado, action, pendente] = useActionState(
    editarSecao.bind(null, secao.id),
    undefined
  );
  return (
    <details>
      <summary
        aria-label={`Editar ${secao.titulo}`}
        className="flex size-8 cursor-pointer list-none items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Pencil size={14} aria-hidden />
      </summary>
      <form
        action={action}
        className="absolute inset-x-4 z-10 mt-2 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg"
      >
        <input
          name="titulo"
          defaultValue={secao.titulo}
          required
          className={classeCampo}
        />
        <textarea
          name="texto"
          rows={5}
          defaultValue={secao.texto}
          required
          className={classeCampo}
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pendente}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
          >
            {pendente ? "Salvando..." : "Salvar"}
          </button>
          {estado?.erro && <p className="text-xs text-rosa">{estado.erro}</p>}
        </div>
      </form>
    </details>
  );
}

function NovaSecao() {
  const [estado, action, pendente] = useActionState(adicionarSecao, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!pendente && !estado?.erro) formRef.current?.reset();
  }, [pendente, estado]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 border-t border-border p-5 sm:p-6"
    >
      <p className="text-sm font-medium text-foreground">Nova seção</p>
      <input
        name="titulo"
        required
        placeholder="Título. Ex.: Estacionamento"
        className={classeCampo}
      />
      <textarea
        name="texto"
        required
        rows={3}
        placeholder="O que os padrinhos precisam saber"
        className={classeCampo}
      />
      <div className="flex items-center justify-end gap-4">
        {estado?.erro && <p className="text-sm text-rosa">{estado.erro}</p>}
        <button
          type="submit"
          disabled={pendente}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pendente ? "Adicionando..." : "Adicionar seção"}
        </button>
      </div>
    </form>
  );
}

function BotaoSugerido({ destaque }: { destaque?: boolean }) {
  const [estado, action, pendente] = useActionState(
    gerarManualSugerido,
    undefined
  );
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={pendente}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
          destaque
            ? "bg-accent text-accent-foreground hover:opacity-90"
            : "border border-border bg-card text-foreground/80 hover:border-accent/40 hover:text-accent"
        }`}
      >
        <Sparkles size={16} aria-hidden />
        {pendente ? "Gerando..." : destaque ? "Gerar manual sugerido" : "Adicionar sugestões"}
      </button>
      {typeof estado?.adicionadas === "number" && (
        <p className="text-sm text-verde">
          {estado.adicionadas > 0
            ? `${estado.adicionadas} seções adicionadas.`
            : "Essas seções já existem."}
        </p>
      )}
    </form>
  );
}

export function EditorManualPadrinhos({ secoes }: { secoes: SecaoManualRow[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sol/15 text-[#8a6a1f]">
            <BookOpen size={20} aria-hidden />
          </span>
          <div>
            <h2 className="font-serif text-xl text-foreground">
              Manual dos padrinhos
            </h2>
            <p className="text-xs text-muted-foreground">
              Aparece para quem aceitar o convite, junto com os dados da
              cerimônia.
            </p>
          </div>
        </div>
        {secoes.length > 0 && <BotaoSugerido />}
      </div>

      {secoes.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Comece com um manual pronto (chegada, traje, cortejo, fotos e
            mais) e ajuste ao jeito de vocês.
          </p>
          <div className="mt-4">
            <BotaoSugerido destaque />
          </div>
        </div>
      ) : (
        <ol className="relative divide-y divide-border">
          {secoes.map((s, i) => (
            <li key={s.id} className="relative flex items-start gap-4 p-5 sm:px-6">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground/70">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground">{s.titulo}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {s.texto}
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <EditarSecao secao={s} />
                <form
                  action={removerSecao.bind(null, s.id)}
                  onSubmit={(e) => {
                    if (!window.confirm(`Remover "${s.titulo}"?`)) e.preventDefault();
                  }}
                >
                  <button
                    type="submit"
                    aria-label={`Remover ${s.titulo}`}
                    className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rosa/10 hover:text-rosa"
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ol>
      )}

      <NovaSecao />
    </section>
  );
}
