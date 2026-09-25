import * as z from "zod";

function opcional() {
  return z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null));
}

export const esquemaNovoConvidado = z.object({
  nome: z.string().trim().min(2, { error: "Informe o nome do convidado." }),
  lado: z
    .enum(["noiva", "noivo", ""])
    .nullish()
    .transform((v) => (v ? v : null)),
  telefone: z
    .string()
    .nullish()
    .transform((v) => {
      const digitos = (v ?? "").replace(/\D/g, "");
      return digitos.length >= 10 ? digitos : null;
    }),
  limiteAcompanhantes: z
    .string()
    .nullish()
    .transform((v) => {
      const n = Number(v ?? 0);
      return Number.isFinite(n) && n > 0 ? Math.min(n, 20) : 0;
    }),
});

export const esquemaResposta = z.object({
  confirmado: z.enum(["sim", "nao"]).transform((v) => v === "sim"),
  numeroAcompanhantes: z
    .string()
    .nullish()
    .transform((v) => {
      const n = Number(v ?? 0);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }),
  nomesAcompanhantes: opcional(),
  restricaoAlimentar: opcional(),
  mensagem: opcional(),
});
