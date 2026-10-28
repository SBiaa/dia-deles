"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { exigirAdmin } from "@/lib/dal";
import { esquemaMensagem } from "@/lib/validacao/suporte";
import { gerarTokenDefinirSenha } from "@/lib/tokens";
import {
  adicionarMensagem,
  atualizarStatusChamado,
  buscarChamado,
  type StatusChamado,
} from "@/lib/db/queries/suporte";
import {
  gerarTokenRedefinicao,
  trocarEmailUsuario,
} from "@/lib/db/queries/admin";
import { buscarUsuarioPorId } from "@/lib/db/queries/usuarios";

export type EstadoAdmin =
  | { erro?: string; sucesso?: string; link?: string }
  | undefined;

export async function responderComoAdmin(
  chamadoId: string,
  _estado: EstadoAdmin,
  formData: FormData
): Promise<EstadoAdmin> {
  await exigirAdmin();
  if (!(await buscarChamado(chamadoId))) {
    return { erro: "Chamado não encontrado." };
  }

  const validado = esquemaMensagem.safeParse({ texto: formData.get("texto") });
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Mensagem inválida." };
  }
  await adicionarMensagem(chamadoId, "admin", validado.data.texto);
  revalidatePath(`/admin/suporte/${chamadoId}`);
  revalidatePath("/admin/suporte");
  return { sucesso: "Resposta enviada." };
}

export async function alterarStatusChamado(
  chamadoId: string,
  status: StatusChamado
): Promise<void> {
  await exigirAdmin();
  if (!["aberto", "em_andamento", "resolvido"].includes(status)) return;
  await atualizarStatusChamado(chamadoId, status);
  revalidatePath(`/admin/suporte/${chamadoId}`);
  revalidatePath("/admin/suporte");
}

/** Gera um link de "definir nova senha" (vale 2 dias) para o admin repassar. */
export async function gerarLinkRedefinicao(
  usuarioId: string,
  _estado: EstadoAdmin
): Promise<EstadoAdmin> {
  await exigirAdmin();
  const usuario = await buscarUsuarioPorId(usuarioId);
  if (!usuario) return { erro: "Usuário não encontrado." };

  const token = gerarTokenDefinirSenha();
  await gerarTokenRedefinicao(usuarioId, token);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo =
    h.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  return { link: `${protocolo}://${host}/definir-senha/${token}` };
}

export async function corrigirEmail(
  usuarioId: string,
  _estado: EstadoAdmin,
  formData: FormData
): Promise<EstadoAdmin> {
  await exigirAdmin();
  const validado = z
    .email()
    .safeParse(String(formData.get("email") ?? "").trim());
  if (!validado.success) return { erro: "E-mail inválido." };

  const ok = await trocarEmailUsuario(usuarioId, validado.data);
  if (!ok) return { erro: "Esse e-mail já pertence a outra conta." };
  revalidatePath(`/admin/casais/${usuarioId}`);
  return { sucesso: "E-mail atualizado." };
}
