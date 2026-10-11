import type { ConvidadoRow } from "@/lib/db/queries/convidados";
import type { MesaRow } from "@/lib/db/queries/mesas";

export type ConvidadoMesa = {
  id: string;
  nome: string;
  lado: string | null;
  lugares: number;
  mesaId: string | null;
};

/** Cada confirmado ocupa um lugar, mais um por acompanhante. */
export function lugaresDoConvidado(c: ConvidadoRow): number {
  return 1 + c.numero_acompanhantes;
}

/** Só quem confirmou presença entra no mapa. */
export function convidadosParaMesas(convidados: ConvidadoRow[]): ConvidadoMesa[] {
  return convidados
    .filter((c) => c.confirmado === true)
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      lado: c.lado,
      lugares: lugaresDoConvidado(c),
      mesaId: c.mesa_id,
    }));
}

const ORDEM_LADO: Record<string, number> = { noiva: 0, noivo: 1 };

/**
 * Distribui quem está sem mesa preenchendo as mesas em ordem, agrupando por
 * lado e nome. Quem não couber em nenhuma mesa fica sem mesa.
 */
export function distribuirAutomaticamente(
  mesas: MesaRow[],
  convidados: ConvidadoMesa[]
): { convidadoId: string; mesaId: string }[] {
  const livres = new Map<string, number>(
    mesas.map((m) => [m.id, m.capacidade])
  );
  for (const c of convidados) {
    if (c.mesaId && livres.has(c.mesaId)) {
      livres.set(c.mesaId, (livres.get(c.mesaId) ?? 0) - c.lugares);
    }
  }

  const semMesa = convidados
    .filter((c) => !c.mesaId || !livres.has(c.mesaId))
    .sort(
      (a, b) =>
        (ORDEM_LADO[a.lado ?? ""] ?? 2) - (ORDEM_LADO[b.lado ?? ""] ?? 2) ||
        a.nome.localeCompare(b.nome, "pt-BR")
    );

  const resultado: { convidadoId: string; mesaId: string }[] = [];
  for (const c of semMesa) {
    const mesa = mesas.find((m) => (livres.get(m.id) ?? 0) >= c.lugares);
    if (!mesa) continue;
    livres.set(mesa.id, (livres.get(mesa.id) ?? 0) - c.lugares);
    resultado.push({ convidadoId: c.id, mesaId: mesa.id });
  }
  return resultado;
}
