import * as z from "zod";

export const esquemaCadastro = z.object({
  nome: z.string().trim().min(2, { error: "Informe seu nome." }),
  email: z.email({ error: "E-mail inválido." }).trim(),
  senha: z
    .string()
    .min(8, { error: "A senha precisa ter pelo menos 8 caracteres." }),
  nomeParceiro1: z
    .string()
    .trim()
    .min(2, { error: "Informe o nome de um dos noivos." }),
  nomeParceiro2: z
    .string()
    .trim()
    .min(2, { error: "Informe o nome do outro noivo." }),
  dataCasamento: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null)),
});

export type DadosCadastro = z.infer<typeof esquemaCadastro>;

export const esquemaLogin = z.object({
  email: z.email({ error: "E-mail inválido." }).trim(),
  senha: z.string().min(1, { error: "Informe sua senha." }),
});
