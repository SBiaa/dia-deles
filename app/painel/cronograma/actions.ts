"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { esquemaItemCronograma } from "@/lib/validacao/cronograma";
import {
  atualizarItemCronograma,
  criarItemCronograma,
  definirTokenCronograma,
  inserirItensSugeridos,
  removerItemCronograma,
} from "@/lib/db/queries/cronograma";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { horaDaCerimonia, sugerirCronograma } from "@/lib/cronograma";
import { gerarTokenCompartilhamento } from "@/lib/tokens";

export type EstadoFormularioCronograma = { erro?: string } | undefined;

const CAMINHO = "/painel/cronograma";

function lerCampos(formData: FormData) {
  return esquemaItemCronograma.safeParse({
    horario: formData.get("horario"),
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    local: formData.get("local"),
    responsavel: formData.get("responsavel"),
  });
}

export async function criarItem(
  _estado: EstadoFormularioCronograma,
  formData: FormData
): Promise<EstadoFormularioCronograma> {
  const usuario = await exigirSessao();
  const validado = lerCampos(formData);
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }
  await criarItemCronograma({
    casamentoId: usuario.casamentoId,
    ...validado.data,
  });
  revalidatePath(CAMINHO);
}

export async function editarItem(
  id: string,
  _estado: EstadoFormularioCronograma,
  formData: FormData
): Promise<EstadoFormularioCronograma> {
  const usuario = await exigirSessao();
  const validado = lerCampos(formData);
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }
  await atualizarItemCronograma(id, usuario.casamentoId, validado.data);
  revalidatePath(CAMINHO);
}

export async function removerItem(id: string) {
  const usuario = await exigirSessao();
  await removerItemCronograma(id, usuario.casamentoId);
  revalidatePath(CAMINHO);
}

export type EstadoRoteiro = { erro?: string; adicionados?: number } | undefined;

export async function gerarRoteiroSugerido(
  _estado: EstadoRoteiro
): Promise<EstadoRoteiro> {
  const usuario = await exigirSessao();
  const casamento = await buscarCasamentoPorId(usuario.casamentoId);
  if (!casamento) return { erro: "Casamento não encontrado." };

  const itens = sugerirCronograma(horaDaCerimonia(casamento.cerimonia_data_hora));
  const adicionados = await inserirItensSugeridos(usuario.casamentoId, itens);
  revalidatePath(CAMINHO);
  return { adicionados };
}

export async function gerarLinkCronograma() {
  const usuario = await exigirSessao();
  await definirTokenCronograma(usuario.casamentoId, gerarTokenCompartilhamento());
  revalidatePath(CAMINHO);
}

export async function revogarLinkCronograma() {
  const usuario = await exigirSessao();
  await definirTokenCronograma(usuario.casamentoId, null);
  revalidatePath(CAMINHO);
}
