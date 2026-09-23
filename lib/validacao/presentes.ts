import * as z from "zod";

function opcional() {
  return z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null));
}

export const esquemaPresente = z.object({
  nome: z.string().trim().min(1, { error: "Informe o nome do presente." }),
  descricao: opcional(),
  preco: z
    .string()
    .nullish()
    .transform((v) => {
      if (!v) return null;
      const numero = Number(v.replace(",", "."));
      return Number.isFinite(numero) && numero > 0
        ? Math.round(numero * 100)
        : null;
    }),
});

export const esquemaReserva = z.object({
  presenteId: z.string().min(1),
  nomeConvidado: z.string().trim().min(2, { error: "Informe seu nome." }),
  email: opcional(),
  mensagem: opcional(),
  site: opcional(),
});
