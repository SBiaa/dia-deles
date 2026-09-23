import * as z from "zod";

function opcional() {
  return z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null));
}

export const esquemaSite = z.object({
  nomeParceiro1: z.string().trim().min(1, { error: "Informe o nome." }),
  nomeParceiro2: z.string().trim().min(1, { error: "Informe o nome." }),
  dataCasamento: opcional(),
  historiaTitulo: opcional(),
  historiaTexto: opcional(),
  cerimoniaLocalNome: opcional(),
  cerimoniaEndereco: opcional(),
  cerimoniaDataHora: opcional(),
  cerimoniaMapaUrl: opcional(),
  recepcaoLocalNome: opcional(),
  recepcaoEndereco: opcional(),
  recepcaoDataHora: opcional(),
  recepcaoMapaUrl: opcional(),
  instagramUrl: opcional(),
  fotoCapaUrl: opcional(),
});

export type DadosSite = z.infer<typeof esquemaSite>;
