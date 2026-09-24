import * as z from "zod";

function opcional() {
  return z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null));
}

function valorMonetario() {
  return z
    .string()
    .nullish()
    .transform((v) => {
      if (!v) return null;
      const numero = Number(v.replace(",", "."));
      return Number.isFinite(numero) && numero > 0
        ? Math.round(numero * 100)
        : null;
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
    .transform((v) => {
      const numero = Number(v.replace(",", "."));
      return Number.isFinite(numero) && numero >= 0
        ? Math.round(numero * 100)
        : null;
    })
    .refine((v) => v !== null, { error: "Informe um valor válido." }),
});
