import type { CasamentoRow } from "@/lib/db/queries/casamentos";

function formatarDataHora(valor: string | null, fusoHorario: string) {
  if (!valor) return null;
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: fusoHorario,
    }).format(new Date(valor));
  } catch {
    return null;
  }
}

function Bloco({
  titulo,
  local,
  endereco,
  dataHora,
  mapaUrl,
}: {
  titulo: string;
  local: string | null;
  endereco: string | null;
  dataHora: string | null;
  mapaUrl: string | null;
}) {
  if (!local && !endereco && !dataHora) return null;

  return (
    <div className="flex-1 rounded-2xl border border-border bg-card p-6 text-center">
      <p className="text-sm uppercase tracking-widest text-accent">
        {titulo}
      </p>
      {local && (
        <p className="mt-3 font-serif text-xl text-foreground">{local}</p>
      )}
      {dataHora && (
        <p className="mt-2 text-sm text-muted-foreground">{dataHora}</p>
      )}
      {endereco && (
        <p className="mt-1 text-sm text-muted-foreground">{endereco}</p>
      )}
      {mapaUrl && (
        <a
          href={mapaUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-accent underline"
        >
          Ver no mapa
        </a>
      )}
    </div>
  );
}

export function Detalhes({ casamento }: { casamento: CasamentoRow }) {
  const cerimonia = {
    local: casamento.cerimonia_local_nome,
    endereco: casamento.cerimonia_endereco,
    dataHora: formatarDataHora(
      casamento.cerimonia_data_hora,
      casamento.fuso_horario
    ),
    mapaUrl: casamento.cerimonia_mapa_url,
  };
  const recepcao = {
    local: casamento.recepcao_local_nome,
    endereco: casamento.recepcao_endereco,
    dataHora: formatarDataHora(
      casamento.recepcao_data_hora,
      casamento.fuso_horario
    ),
    mapaUrl: casamento.recepcao_mapa_url,
  };

  const nenhumaInfo =
    !cerimonia.local &&
    !cerimonia.endereco &&
    !cerimonia.dataHora &&
    !recepcao.local &&
    !recepcao.endereco &&
    !recepcao.dataHora;

  if (nenhumaInfo) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-center text-sm uppercase tracking-widest text-accent">
        Cerimônia &amp; recepção
      </p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <Bloco titulo="Cerimônia" {...cerimonia} />
        <Bloco titulo="Recepção" {...recepcao} />
      </div>
    </section>
  );
}
