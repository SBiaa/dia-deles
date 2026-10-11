import * as z from "zod";

function opcional(max = 300) {
  return z
    .string()
    .trim()
    .max(max, { error: "Texto muito longo." })
    .nullish()
    .transform((v) => (v ? v : null));
}

export const esquemaItemCronograma = z.object({
  horario: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Informe um horário válido." }),
  titulo: z
    .string()
    .trim()
    .min(1, { error: "Informe a atividade." })
    .max(120, { error: "Atividade muito longa." }),
  descricao: opcional(500),
  local: opcional(120),
  responsavel: opcional(80),
});
