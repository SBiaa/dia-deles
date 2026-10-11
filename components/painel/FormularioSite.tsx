"use client";

import { useActionState } from "react";
import {
  BookOpen,
  Church,
  CircleCheck,
  Heart,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { atualizarSite } from "@/app/painel/site/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { CampoFotoCapa } from "@/components/painel/CampoFotoCapa";
import type { CasamentoRow } from "@/lib/db/queries/casamentos";

function paraDatetimeLocal(valor: string | null): string {
  if (!valor) return "";
  return valor.slice(0, 16);
}

function Secao({
  icone: Icone,
  titulo,
  dica,
  cor,
  children,
}: {
  icone: LucideIcon;
  titulo: string;
  dica: string;
  cor: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${cor}`}
        >
          <Icone size={20} aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-foreground">{titulo}</h2>
          <p className="text-xs text-muted-foreground">{dica}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function FormularioSite({ casamento }: { casamento: CasamentoRow }) {
  const [estado, action, pendente] = useActionState(atualizarSite, undefined);

  return (
    <form action={action} className="flex flex-col gap-6">
      <Secao
        icone={Heart}
        titulo="Os noivos"
        dica="Nomes, data e a foto que abre o site."
        cor="bg-rosa/10 text-rosa"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Nome de um dos noivos"
            name="nomeParceiro1"
            required
            defaultValue={casamento.nome_parceiro_1}
          />
          <Campo
            label="Nome do outro noivo"
            name="nomeParceiro2"
            required
            defaultValue={casamento.nome_parceiro_2}
          />
          <Campo
            label="Data do casamento"
            name="dataCasamento"
            type="date"
            defaultValue={casamento.data_casamento?.slice(0, 10) ?? ""}
          />
          <Campo
            label="Instagram (opcional)"
            name="instagramUrl"
            defaultValue={casamento.instagram_url ?? ""}
          />
        </div>
        <CampoFotoCapa urlInicial={casamento.foto_capa_url} />
      </Secao>

      <Secao
        icone={BookOpen}
        titulo="Nossa história"
        dica="Conte como tudo começou. Um texto curto já encanta."
        cor="bg-sol/15 text-[#8a6a1f]"
      >
        <Campo
          label="Título"
          name="historiaTitulo"
          placeholder="Ex.: Como tudo começou"
          defaultValue={casamento.historia_titulo ?? ""}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="historiaTexto"
            className="text-sm text-muted-foreground"
          >
            Texto
          </label>
          <textarea
            id="historiaTexto"
            name="historiaTexto"
            rows={7}
            defaultValue={casamento.historia_texto ?? ""}
            className="rounded-xl border border-border bg-card px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none focus:border-accent"
          />
        </div>
      </Secao>

      <Secao
        icone={Church}
        titulo="Cerimônia"
        dica="Onde e quando os convidados devem chegar."
        cor="bg-accent/10 text-accent"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Local"
            name="cerimoniaLocalNome"
            defaultValue={casamento.cerimonia_local_nome ?? ""}
          />
          <Campo
            label="Endereço"
            name="cerimoniaEndereco"
            defaultValue={casamento.cerimonia_endereco ?? ""}
          />
          <Campo
            label="Data e hora"
            name="cerimoniaDataHora"
            type="datetime-local"
            defaultValue={paraDatetimeLocal(casamento.cerimonia_data_hora)}
          />
          <Campo
            label="Link do mapa (opcional)"
            name="cerimoniaMapaUrl"
            defaultValue={casamento.cerimonia_mapa_url ?? ""}
          />
        </div>
      </Secao>

      <Secao
        icone={PartyPopper}
        titulo="Recepção"
        dica="A festa, se for em outro lugar ou horário."
        cor="bg-verde/10 text-verde"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Local"
            name="recepcaoLocalNome"
            defaultValue={casamento.recepcao_local_nome ?? ""}
          />
          <Campo
            label="Endereço"
            name="recepcaoEndereco"
            defaultValue={casamento.recepcao_endereco ?? ""}
          />
          <Campo
            label="Data e hora"
            name="recepcaoDataHora"
            type="datetime-local"
            defaultValue={paraDatetimeLocal(casamento.recepcao_data_hora)}
          />
          <Campo
            label="Link do mapa (opcional)"
            name="recepcaoMapaUrl"
            defaultValue={casamento.recepcao_mapa_url ?? ""}
          />
        </div>
      </Secao>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 px-5 py-3.5 shadow-lg backdrop-blur">
        <p
          aria-live="polite"
          className={`flex items-center gap-2 text-sm ${
            estado?.erro ? "text-rosa" : estado?.salvo ? "text-verde" : "text-muted-foreground"
          }`}
        >
          {estado?.erro ? (
            estado.erro
          ) : estado?.salvo ? (
            <>
              <CircleCheck size={16} aria-hidden /> Alterações salvas.
            </>
          ) : (
            "As mudanças só aparecem no site depois de salvar."
          )}
        </p>
        <Botao type="submit" disabled={pendente} className="shrink-0">
          {pendente ? "Salvando..." : "Salvar alterações"}
        </Botao>
      </div>
    </form>
  );
}
