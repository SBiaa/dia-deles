"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { esquemaCusto, esquemaPagamento } from "@/lib/validacao/custos";
import {
  criarCusto as salvarCusto,
  atualizarValorPago as salvarValorPago,
  arquivarCusto as arquivar,
} from "@/lib/db/queries/custos";

export type EstadoFormularioCusto = { erro?: string } | undefined;

export async function criarCusto(
  _estado: EstadoFormularioCusto,
  formData: FormData
): Promise<EstadoFormularioCusto> {
  const usuario = await exigirSessao();

  const validado = esquemaCusto.safeParse({
    categoria: formData.get("categoria"),
    fornecedor: formData.get("fornecedor"),
    observacoes: formData.get("observacoes"),
    valor: formData.get("valor"),
  });

  if (!validado.success) {
    return { erro: "Confira os campos preenchidos." };
  }

  await salvarCusto({
    casamentoId: usuario.casamentoId,
    categoria: validado.data.categoria,
    fornecedor: validado.data.fornecedor,
    observacoes: validado.data.observacoes,
    valorCentavos: validado.data.valor,
  });

  revalidatePath("/painel/custos");
}

export async function registrarPagamento(custoId: string, formData: FormData) {
  const usuario = await exigirSessao();

  const validado = esquemaPagamento.safeParse({
    valorPago: formData.get("valorPago"),
  });

  if (!validado.success) return;

  await salvarValorPago(custoId, usuario.casamentoId, validado.data.valorPago);
  revalidatePath("/painel/custos");
}

export async function arquivarCusto(id: string) {
  const usuario = await exigirSessao();
  await arquivar(id, usuario.casamentoId);
  revalidatePath("/painel/custos");
}
