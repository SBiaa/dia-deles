import type { StatusChamado, TipoChamado } from "./db/queries/suporte";

export const ROTULO_TIPO: Record<TipoChamado, string> = {
  bug: "Algo deu errado",
  duvida: "Dúvida",
  sugestao: "Sugestão",
  outro: "Outro assunto",
};

export const ROTULO_STATUS: Record<StatusChamado, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
};

export const COR_STATUS: Record<StatusChamado, string> = {
  aberto: "bg-rosa/10 text-rosa",
  em_andamento: "bg-sol-suave text-foreground",
  resolvido: "bg-verde/10 text-verde",
};

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

/** "há 3 dias", "hoje" etc. para a coluna de último acesso. */
export function tempoAtras(iso: string | null): string {
  if (!iso) return "nunca";
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}
