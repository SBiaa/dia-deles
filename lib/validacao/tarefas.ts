import * as z from "zod";

function opcional() {
  return z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null));
}

export const esquemaTarefa = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, { error: "Informe o que precisa ser feito." }),
  descricao: opcional(),
  prazo: opcional(),
});
