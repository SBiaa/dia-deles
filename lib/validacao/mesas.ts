import * as z from "zod";

const capacidade = z.coerce
  .number()
  .int({ error: "Informe um número de lugares válido." })
  .min(1, { error: "A mesa precisa de pelo menos 1 lugar." })
  .max(40, { error: "No máximo 40 lugares por mesa." });

export const esquemaNovasMesas = z.object({
  nome: z
    .string()
    .trim()
    .max(60, { error: "Nome muito longo." })
    .nullish()
    .transform((v) => (v ? v : null)),
  capacidade,
  quantidade: z.coerce
    .number()
    .int()
    .min(1, { error: "Informe ao menos 1 mesa." })
    .max(40, { error: "No máximo 40 mesas por vez." }),
});

export const esquemaEditarMesa = z.object({
  nome: z.string().trim().min(1, { error: "Informe o nome da mesa." }).max(60),
  capacidade,
});
