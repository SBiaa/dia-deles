import * as z from "zod";

export const esquemaChamado = z.object({
  nome: z.string().trim().min(2, { error: "Informe seu nome." }).max(100),
  email: z.email({ error: "E-mail inválido." }).trim().max(160),
  tipo: z.enum(["bug", "duvida", "sugestao", "outro"], {
    error: "Escolha o tipo.",
  }),
  assunto: z
    .string()
    .trim()
    .min(4, { error: "Resuma o assunto em poucas palavras." })
    .max(120, { error: "Assunto muito longo." }),
  texto: z
    .string()
    .trim()
    .min(10, { error: "Conte um pouco mais para a gente entender." })
    .max(4000, { error: "Mensagem muito longa." }),
});

export const esquemaMensagem = z.object({
  texto: z
    .string()
    .trim()
    .min(1, { error: "Escreva uma mensagem." })
    .max(4000, { error: "Mensagem muito longa." }),
});
