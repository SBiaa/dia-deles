import * as z from "zod";

export const esquemaTrocarSlug = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: "Use só letras minúsculas, números e hífen.",
    }),
});

export const esquemaTrocarSenha = z.object({
  senhaAtual: z.string().min(1, { error: "Informe sua senha atual." }),
  senhaNova: z
    .string()
    .min(8, { error: "A nova senha precisa ter pelo menos 8 caracteres." }),
});
