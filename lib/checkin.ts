import type { ConvidadoRow } from "@/lib/db/queries/convidados";

/**
 * Aceita o texto lido no QR: o link do convite (".../slug/convite/CODIGO")
 * ou só o código.
 */
export function extrairCodigo(texto: string): string | null {
  const limpo = texto.trim();
  if (!limpo) return null;
  const semQuery = limpo.split(/[?#]/)[0];
  const ultimo = semQuery.split("/").filter(Boolean).pop() ?? "";
  return /^[a-z0-9]{4,32}$/i.test(ultimo) ? ultimo.toLowerCase() : null;
}

/** Pessoas esperadas: o convidado mais os acompanhantes confirmados. */
export function pessoasEsperadas(c: ConvidadoRow): number {
  return c.confirmado === true ? 1 + c.numero_acompanhantes : 1;
}

export type ResumoCheckin = {
  esperados: number;
  chegaram: number;
  faltam: number;
  convidadosQueChegaram: number;
  convidadosEsperados: number;
};

export function calcularResumoCheckin(convidados: ConvidadoRow[]): ResumoCheckin {
  const confirmados = convidados.filter((c) => c.confirmado === true);
  const esperados = confirmados.reduce((s, c) => s + pessoasEsperadas(c), 0);
  const chegaram = convidados
    .filter((c) => c.checkin_em)
    .reduce((s, c) => s + (c.checkin_pessoas ?? pessoasEsperadas(c)), 0);
  return {
    esperados,
    chegaram,
    faltam: Math.max(esperados - chegaram, 0),
    convidadosQueChegaram: convidados.filter((c) => c.checkin_em).length,
    convidadosEsperados: confirmados.length,
  };
}
