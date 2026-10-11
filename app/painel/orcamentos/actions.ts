"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { esquemaProposta } from "@/lib/validacao/custos";
import {
  criarProposta as salvarProposta,
  desfazerEscolha as desfazer,
  escolherProposta as escolher,
  removerProposta as remover,
} from "@/lib/db/queries/propostas";

export type EstadoFormularioProposta = { erro?: string } | undefined;

function atualizarTelas() {
  revalidatePath("/painel/orcamentos");
  revalidatePath("/painel/custos");
  revalidatePath("/painel");
}

export async function criarProposta(
  _estado: EstadoFormularioProposta,
  formData: FormData
): Promise<EstadoFormularioProposta> {
  const usuario = await exigirSessao();

  const validado = esquemaProposta.safeParse({
    categoria: formData.get("categoria"),
    fornecedor: formData.get("fornecedor"),
    valor: formData.get("valor"),
    condicoes: formData.get("condicoes"),
    inclui: formData.get("inclui"),
    contato: formData.get("contato"),
    validade: formData.get("validade"),
    observacoes: formData.get("observacoes"),
  });
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }

  await salvarProposta({
    casamentoId: usuario.casamentoId,
    categoria: validado.data.categoria,
    fornecedor: validado.data.fornecedor,
    valorCentavos: validado.data.valor as number,
    condicoes: validado.data.condicoes,
    inclui: validado.data.inclui,
    contato: validado.data.contato,
    validade: validado.data.validade,
    observacoes: validado.data.observacoes,
  });
  atualizarTelas();
}

export async function escolherProposta(id: string) {
  const usuario = await exigirSessao();
  await escolher(id, usuario.casamentoId);
  atualizarTelas();
}

export async function desfazerEscolha(id: string) {
  const usuario = await exigirSessao();
  await desfazer(id, usuario.casamentoId);
  atualizarTelas();
}

export async function removerProposta(id: string) {
  const usuario = await exigirSessao();
  await remover(id, usuario.casamentoId);
  atualizarTelas();
}
