"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import {
  esquemaMensagemPadrinhos,
  esquemaNovoPadrinho,
  esquemaSecaoManual,
} from "@/lib/validacao/padrinhos";
import {
  atualizarSecaoManual,
  criarPadrinho,
  criarSecaoManual,
  definirMensagemPadrinhos,
  inserirSecoesSugeridas,
  removerPadrinho as remover,
  removerSecaoManual,
} from "@/lib/db/queries/padrinhos";
import { MANUAL_SUGERIDO } from "@/lib/padrinhos";
import { gerarTokenCompartilhamento } from "@/lib/tokens";

export type EstadoFormularioPadrinho = { erro?: string } | undefined;

const CAMINHO = "/painel/padrinhos";

export async function adicionarPadrinho(
  _estado: EstadoFormularioPadrinho,
  formData: FormData
): Promise<EstadoFormularioPadrinho> {
  const usuario = await exigirSessao();

  const validado = esquemaNovoPadrinho.safeParse({
    nome: formData.get("nome"),
    papel: formData.get("papel"),
    telefone: formData.get("telefone"),
    horarioChegada: formData.get("horarioChegada"),
    notaPessoal: formData.get("notaPessoal"),
  });
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }

  await criarPadrinho({
    casamentoId: usuario.casamentoId,
    ...validado.data,
    token: gerarTokenCompartilhamento(),
  });
  revalidatePath(CAMINHO);
}

export async function removerPadrinho(id: string) {
  const usuario = await exigirSessao();
  await remover(id, usuario.casamentoId);
  revalidatePath(CAMINHO);
}

export async function salvarMensagem(
  _estado: EstadoFormularioPadrinho,
  formData: FormData
): Promise<EstadoFormularioPadrinho> {
  const usuario = await exigirSessao();
  const validado = esquemaMensagemPadrinhos.safeParse({
    mensagem: formData.get("mensagem"),
  });
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira o texto." };
  }
  await definirMensagemPadrinhos(usuario.casamentoId, validado.data.mensagem);
  revalidatePath(CAMINHO);
}

function lerSecao(formData: FormData) {
  return esquemaSecaoManual.safeParse({
    titulo: formData.get("titulo"),
    texto: formData.get("texto"),
  });
}

export async function adicionarSecao(
  _estado: EstadoFormularioPadrinho,
  formData: FormData
): Promise<EstadoFormularioPadrinho> {
  const usuario = await exigirSessao();
  const validado = lerSecao(formData);
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }
  await criarSecaoManual({
    casamentoId: usuario.casamentoId,
    ...validado.data,
  });
  revalidatePath(CAMINHO);
}

export async function editarSecao(
  id: string,
  _estado: EstadoFormularioPadrinho,
  formData: FormData
): Promise<EstadoFormularioPadrinho> {
  const usuario = await exigirSessao();
  const validado = lerSecao(formData);
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }
  await atualizarSecaoManual(id, usuario.casamentoId, validado.data);
  revalidatePath(CAMINHO);
}

export async function removerSecao(id: string) {
  const usuario = await exigirSessao();
  await removerSecaoManual(id, usuario.casamentoId);
  revalidatePath(CAMINHO);
}

export type EstadoManualSugerido = { adicionadas?: number } | undefined;

export async function gerarManualSugerido(
  _estado: EstadoManualSugerido
): Promise<EstadoManualSugerido> {
  const usuario = await exigirSessao();
  const adicionadas = await inserirSecoesSugeridas(
    usuario.casamentoId,
    MANUAL_SUGERIDO
  );
  revalidatePath(CAMINHO);
  return { adicionadas };
}
