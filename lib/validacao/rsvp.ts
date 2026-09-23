import * as z from "zod";

function opcional() {
  return z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null));
}

export const esquemaRsvp = z.object({
  casamentoId: z.string().min(1),
  nomeConvidado: z.string().trim().min(2, { error: "Informe seu nome." }),
  email: opcional(),
  telefone: opcional(),
  confirmado: z.enum(["sim", "nao"]).transform((v) => v === "sim"),
  numeroAcompanhantes: z
    .string()
    .nullish()
    .transform((v) => {
      const n = Number(v ?? 0);
      return Number.isFinite(n) && n > 0 ? Math.min(n, 20) : 0;
    }),
  nomesAcompanhantes: opcional(),
  mensagem: opcional(),
  // honeypot: deve chegar vazio; bot preenche
  site: opcional(),
});
