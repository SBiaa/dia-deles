"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { exigirSessao } from "@/lib/dal";
import { esquemaChamado, esquemaMensagem } from "@/lib/validacao/suporte";
import {
  adicionarMensagem,
  buscarChamado,
  contarChamadosRecentes,
  criarChamado,
} from "@/lib/db/queries/suporte";

export type EstadoSuporte =
  | {
      erro?: string;
      sucesso?: string;
      camposInvalidos?: Record<string, string[] | undefined>;
    }
  | undefined;

/** Abre um chamado. Funciona logado (painel) ou não (página /contato). */
export async function abrirChamado(
  _estado: EstadoSuporte,
  formData: FormData
): Promise<EstadoSuporte> {
  // Campo escondido que só robôs preenchem.
  if (formData.get("site")) return { sucesso: "Mensagem enviada." };

  const session = await auth();
  const usuarioId = session?.user?.id ?? null;

  const validado = esquemaChamado.safeParse({
    nome: formData.get("nome"),
    email: session?.user?.email ?? formData.get("email"),
    tipo: formData.get("tipo"),
    assunto: formData.get("assunto"),
    texto: formData.get("texto"),
  });
  if (!validado.success) {
    return { camposInvalidos: validado.error.flatten().fieldErrors };
  }
  const dados = validado.data;

  if ((await contarChamadosRecentes(dados.email)) >= 5) {
    return {
      erro: "Você já enviou várias mensagens agora há pouco. Aguarde um pouco e tente de novo.",
    };
  }

  const navegador = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
  const id = await criarChamado({ usuarioId, ...dados, navegador });

  if (usuarioId) {
    revalidatePath("/painel/suporte");
    redirect(`/painel/suporte/${id}`);
  }
  return {
    sucesso:
      "Recebemos sua mensagem! Vamos responder no e-mail que você informou.",
  };
}

/** Resposta do casal dentro de um chamado dele. */
export async function responderComoCasal(
  chamadoId: string,
  _estado: EstadoSuporte,
  formData: FormData
): Promise<EstadoSuporte> {
  const usuario = await exigirSessao();
  const chamado = await buscarChamado(chamadoId);
  if (!chamado || chamado.usuario_id !== usuario.id) {
    return { erro: "Chamado não encontrado." };
  }

  const validado = esquemaMensagem.safeParse({ texto: formData.get("texto") });
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Mensagem inválida." };
  }

  await adicionarMensagem(chamadoId, "casal", validado.data.texto);
  revalidatePath(`/painel/suporte/${chamadoId}`);
  return { sucesso: "Mensagem enviada." };
}
