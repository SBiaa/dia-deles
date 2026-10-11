import * as z from "zod";
import { PAPEIS_PADRINHO } from "@/lib/padrinhos";

function opcional(max = 500) {
  return z
    .string()
    .trim()
    .max(max, { error: "Texto muito longo." })
    .nullish()
    .transform((v) => (v ? v : null));
}

export const esquemaNovoPadrinho = z.object({
  nome: z
    .string()
    .trim()
    .min(2, { error: "Informe o nome." })
    .max(80, { error: "Nome muito longo." }),
  papel: z.enum(PAPEIS_PADRINHO, { error: "Escolha o papel." }),
  telefone: z
    .string()
    .nullish()
    .transform((v) => {
      const digitos = (v ?? "").replace(/\D/g, "");
      return digitos.length >= 10 ? digitos : null;
    }),
  horarioChegada: z
    .string()
    .nullish()
    .transform((v) => (v && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null)),
  notaPessoal: opcional(500),
});

export const esquemaSecaoManual = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, { error: "Informe o título." })
    .max(80, { error: "Título muito longo." }),
  texto: z
    .string()
    .trim()
    .min(1, { error: "Escreva o conteúdo." })
    .max(2000, { error: "Texto muito longo." }),
});

export const esquemaRespostaPadrinho = z.object({
  aceitou: z.enum(["sim", "nao"]).transform((v) => v === "sim"),
  mensagem: opcional(500),
});

export const esquemaMensagemPadrinhos = z.object({
  mensagem: opcional(600),
});
