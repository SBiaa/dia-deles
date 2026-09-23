import { existeSlug } from "./db/queries/casamentos";

const PALAVRAS_RESERVADAS = new Set([
  "login",
  "cadastro",
  "painel",
  "api",
  "admin",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
  "assets",
  "static",
  "www",
  "app",
  "home",
  "sobre",
  "contato",
  "termos",
  "privacidade",
]);

export function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function gerarSlugBase(nomeParceiro1: string, nomeParceiro2: string): string {
  const base = slugificar(`${nomeParceiro1}-e-${nomeParceiro2}`);
  return base || "nosso-casamento";
}

export async function gerarSlugDisponivel(
  nomeParceiro1: string,
  nomeParceiro2: string
): Promise<string> {
  const base = gerarSlugBase(nomeParceiro1, nomeParceiro2);
  let candidato = base;
  let sufixo = 2;

  while (PALAVRAS_RESERVADAS.has(candidato) || (await existeSlug(candidato))) {
    candidato = `${base}-${sufixo}`;
    sufixo += 1;
  }

  return candidato;
}

export function slugValido(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && !PALAVRAS_RESERVADAS.has(slug);
}
