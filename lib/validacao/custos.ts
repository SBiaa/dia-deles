import * as z from "zod";

function opcional() {
  return z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null));
}

/** Aceita "1500", "1500,50", "1.500,50" e "R$ 1.500,50". */
export function paraCentavos(texto: string): number | null {
  let t = texto.replace(/[^\d.,]/g, "");
  if (!t) return null;
  if (t.includes(",")) {
    t = t.replace(/\./g, "").replace(",", ".");
  } else if ((t.match(/\./g) ?? []).length > 1) {
    t = t.replace(/\./g, "");
  }
  const numero = Number(t);
  return Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) : null;
}

function valorMonetario() {
  return z
    .string()
    .nullish()
    .transform((v) => {
      if (!v) return null;
      const centavos = paraCentavos(v);
      return centavos !== null && centavos > 0 ? centavos : null;
    });
}

export const esquemaCusto = z.object({
  categoria: z
    .string()
    .trim()
    .min(1, { error: "Informe a categoria do custo." }),
  fornecedor: opcional(),
  observacoes: opcional(),
  valor: valorMonetario(),
});

export const esquemaPagamento = z.object({
  valorPago: z
    .string()
    .trim()
    .transform((v) => paraCentavos(v))
    .refine((v) => v !== null, { error: "Informe um valor válido." }),
});

export const esquemaOrcamento = z.object({
  categoria: z
    .string()
    .trim()
    .min(1, { error: "Informe a categoria." }),
  valor: z
    .string()
    .nullish()
    .transform((v) => (v ? paraCentavos(v) : null)),
});

export const esquemaParcelamento = z.object({
  numero: z.coerce
    .number()
    .int({ error: "Informe um número de parcelas válido." })
    .min(2, { error: "Use pelo menos 2 parcelas." })
    .max(48, { error: "No máximo 48 parcelas." }),
  primeiroVencimento: z.iso.date({ error: "Informe o primeiro vencimento." }),
});

export const esquemaProposta = z.object({
  categoria: z
    .string()
    .trim()
    .min(1, { error: "Informe a categoria." })
    .max(80),
  fornecedor: z
    .string()
    .trim()
    .min(1, { error: "Informe o fornecedor." })
    .max(120),
  valor: z
    .string()
    .trim()
    .transform((v) => paraCentavos(v))
    .refine((v) => v !== null && v > 0, { error: "Informe o valor da proposta." }),
  condicoes: opcional(),
  inclui: opcional(),
  contato: opcional(),
  validade: opcional(),
  observacoes: opcional(),
});
