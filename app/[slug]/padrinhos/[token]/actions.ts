"use server";

import { revalidatePath } from "next/cache";
import { esquemaRespostaPadrinho } from "@/lib/validacao/padrinhos";
import {
  buscarPadrinhoPorToken,
  registrarRespostaPadrinho,
} from "@/lib/db/queries/padrinhos";

export type EstadoRespostaPadrinho = { erro?: string; ok?: boolean } | undefined;

/** Resposta pública do padrinho; o token do link é a autorização. */
export async function responderConvite(
  token: string,
  _estado: EstadoRespostaPadrinho,
  formData: FormData
): Promise<EstadoRespostaPadrinho> {
  const validado = esquemaRespostaPadrinho.safeParse({
    aceitou: formData.get("aceitou"),
    mensagem: formData.get("mensagem"),
  });
  if (!validado.success) {
    return { erro: "Escolha uma das opções para responder." };
  }

  const padrinho = await buscarPadrinhoPorToken(token);
  if (!padrinho) return { erro: "Convite não encontrado." };

  await registrarRespostaPadrinho(token, validado.data);
  revalidatePath("/painel/padrinhos");
  revalidatePath("/[slug]/padrinhos/[token]", "page");
  return { ok: true };
}
