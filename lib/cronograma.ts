export type ItemSugerido = {
  horario: string; // HH:MM
  titulo: string;
  descricao: string | null;
  local: string | null;
  responsavel: string | null;
};

type Modelo = {
  minutos: number; // em relação ao início da cerimônia
  titulo: string;
  descricao?: string;
  local?: string;
  responsavel?: string;
};

const MODELO: Modelo[] = [
  { minutos: -240, titulo: "Equipe de decoração e buffet no local", descricao: "Montagem, teste de som e conferência do salão.", local: "Recepção", responsavel: "Fornecedores" },
  { minutos: -210, titulo: "Início da maquiagem e do cabelo", responsavel: "Noiva" },
  { minutos: -150, titulo: "Fotógrafo registra os preparativos", responsavel: "Fotógrafo" },
  { minutos: -90, titulo: "Chegada dos padrinhos e da família", responsavel: "Família" },
  { minutos: -60, titulo: "Noivos prontos", descricao: "Última conferência de alianças, votos e documentos.", responsavel: "Cerimonialista" },
  { minutos: -45, titulo: "Recepção dos convidados", descricao: "Entrada, lista de presença e acomodação.", local: "Cerimônia", responsavel: "Cerimonialista" },
  { minutos: -15, titulo: "Posicionamento do cortejo", responsavel: "Cerimonialista" },
  { minutos: 0, titulo: "Cerimônia", local: "Cerimônia" },
  { minutos: 45, titulo: "Fotos com família e padrinhos", responsavel: "Fotógrafo" },
  { minutos: 75, titulo: "Início da recepção", descricao: "Coquetel e acomodação nas mesas.", local: "Recepção", responsavel: "Buffet" },
  { minutos: 90, titulo: "Entrada dos noivos", local: "Recepção", responsavel: "Cerimonialista" },
  { minutos: 105, titulo: "Jantar", local: "Recepção", responsavel: "Buffet" },
  { minutos: 165, titulo: "Corte do bolo e brinde", local: "Recepção", responsavel: "Cerimonialista" },
  { minutos: 195, titulo: "Abertura da pista de dança", local: "Recepção", responsavel: "DJ ou banda" },
  { minutos: 330, titulo: "Encerramento", local: "Recepção", responsavel: "Cerimonialista" },
];

function emMinutos(horario: string): number {
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + m;
}

export function formatarHorario(minutos: number): string {
  const limitado = Math.min(Math.max(minutos, 0), 23 * 60 + 59);
  const h = String(Math.floor(limitado / 60)).padStart(2, "0");
  const m = String(limitado % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/** Hora da cerimônia (HH:MM) a partir de "YYYY-MM-DDTHH:MM..." ou um padrão. */
export function horaDaCerimonia(dataHora: string | null): string {
  const hora = dataHora?.match(/[T ](\d{2}:\d{2})/)?.[1];
  return hora ?? "17:00";
}

export function sugerirCronograma(horaCerimonia: string): ItemSugerido[] {
  const base = emMinutos(horaCerimonia);
  return MODELO.map((m) => ({
    horario: formatarHorario(base + m.minutos),
    titulo: m.titulo,
    descricao: m.descricao ?? null,
    local: m.local ?? null,
    responsavel: m.responsavel ?? null,
  }));
}

/** O banco devolve HH:MM:SS; a tela usa HH:MM. */
export function horarioCurto(horario: string): string {
  return horario.slice(0, 5);
}
