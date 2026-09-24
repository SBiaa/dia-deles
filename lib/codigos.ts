import { existeCodigoConvite } from "./db/queries/convidados";

const ALFABETO = "23456789abcdefghjkmnpqrstuvwxyz";

function sortearCodigo(tamanho = 8): string {
  let codigo = "";
  for (let i = 0; i < tamanho; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

export async function gerarCodigoConvite(): Promise<string> {
  let codigo = sortearCodigo();
  while (await existeCodigoConvite(codigo)) {
    codigo = sortearCodigo();
  }
  return codigo;
}
