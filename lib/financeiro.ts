import type { CustoRow } from "@/lib/db/queries/custos";
import type { OrcamentoRow } from "@/lib/db/queries/orcamentos";
import { somarMeses } from "@/lib/datas";

export const CATEGORIAS_SUGERIDAS = [
  "Local",
  "Buffet",
  "Bebidas",
  "Fotografia e filmagem",
  "Música e som",
  "Decoração e flores",
  "Vestido e traje",
  "Beleza",
  "Convites e papelaria",
  "Bolo e doces",
  "Assessoria",
  "Lua de mel",
  "Outros",
];

/** Normaliza o nome da categoria para agrupar "Buffet", "buffet " e "BUFFÊ". */
export function chaveCategoria(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Divide o total em N parcelas; os centavos que sobram vão para as primeiras. */
export function dividirEmParcelas(totalCentavos: number, n: number): number[] {
  const base = Math.floor(totalCentavos / n);
  const resto = totalCentavos - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < resto ? 1 : 0));
}

export function datasMensais(primeiroVencimento: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    somarMeses(primeiroVencimento, i)
  );
}

export type LinhaCategoria = {
  chave: string;
  categoria: string;
  orcamentoCentavos: number | null;
  contratadoCentavos: number;
  pagoCentavos: number;
};

/** Junta o orçamento por categoria com o que foi contratado e pago. */
export function resumirPorCategoria(
  custos: CustoRow[],
  orcamentos: OrcamentoRow[]
): LinhaCategoria[] {
  const mapa = new Map<string, LinhaCategoria>();

  for (const o of orcamentos) {
    mapa.set(o.categoria_chave, {
      chave: o.categoria_chave,
      categoria: o.categoria,
      orcamentoCentavos: o.valor_centavos,
      contratadoCentavos: 0,
      pagoCentavos: 0,
    });
  }

  for (const c of custos) {
    const chave = chaveCategoria(c.categoria);
    const linha = mapa.get(chave) ?? {
      chave,
      categoria: c.categoria.trim(),
      orcamentoCentavos: null,
      contratadoCentavos: 0,
      pagoCentavos: 0,
    };
    linha.contratadoCentavos += c.valor_centavos ?? 0;
    linha.pagoCentavos += c.valor_pago_centavos;
    mapa.set(chave, linha);
  }

  return [...mapa.values()].sort(
    (a, b) =>
      b.contratadoCentavos +
      (b.orcamentoCentavos ?? 0) -
      (a.contratadoCentavos + (a.orcamentoCentavos ?? 0))
  );
}
