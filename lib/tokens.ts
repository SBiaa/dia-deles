import { randomBytes } from "node:crypto";

export function gerarTokenDefinirSenha(): string {
  return randomBytes(32).toString("hex");
}

/** Token curto o bastante para links compartilháveis, longo o bastante p/ não ser adivinhado. */
export function gerarTokenCompartilhamento(): string {
  return randomBytes(18).toString("base64url");
}
