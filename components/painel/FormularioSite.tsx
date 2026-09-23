"use client";

import { useActionState } from "react";
import { atualizarSite } from "@/app/painel/site/actions";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { CampoFotoCapa } from "@/components/painel/CampoFotoCapa";
import type { CasamentoRow } from "@/lib/db/queries/casamentos";

function paraDatetimeLocal(valor: string | null): string {
  if (!valor) return "";
  return valor.slice(0, 16);
}

export function FormularioSite({ casamento }: { casamento: CasamentoRow }) {
  const [estado, action, pendente] = useActionState(atualizarSite, undefined);

  return (
    <form action={action} className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-lg text-foreground">Os noivos</h2>
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
        </div>
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
        <CampoFotoCapa urlInicial={casamento.foto_capa_url} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-lg text-foreground">Nossa história</h2>
        <Campo
          label="Título"
          name="historiaTitulo"
          defaultValue={casamento.historia_titulo ?? ""}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="historiaTexto" className="text-sm text-muted-foreground">
            Texto
          </label>
          <textarea
            id="historiaTexto"
            name="historiaTexto"
            rows={6}
            defaultValue={casamento.historia_texto ?? ""}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-lg text-foreground">Cerimônia</h2>
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
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-lg text-foreground">Recepção</h2>
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
      </section>

      {estado?.erro && <p className="text-sm text-accent">{estado.erro}</p>}
      {estado?.salvo && (
        <p className="text-sm text-emerald-700">Alterações salvas.</p>
      )}

      <Botao type="submit" disabled={pendente} className="self-start">
        {pendente ? "Salvando..." : "Salvar alterações"}
      </Botao>
    </form>
  );
}
