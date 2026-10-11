"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import {
  esquemaCusto,
  esquemaOrcamento,
  esquemaPagamento,
  esquemaParcelamento,
} from "@/lib/validacao/custos";
import {
  criarCusto as salvarCusto,
  atualizarValorPago as salvarValorPago,
  arquivarCusto as arquivar,
  buscarCustoPorId,
} from "@/lib/db/queries/custos";
import { definirOrcamento } from "@/lib/db/queries/orcamentos";
import {
  alternarParcelaPaga,
  removerParcelas,
  substituirParcelas,
} from "@/lib/db/queries/parcelas";
import { datasMensais, dividirEmParcelas } from "@/lib/financeiro";

export type EstadoFormularioCusto = { erro?: string } | undefined;

const CAMINHO = "/painel/custos";

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

  revalidatePath(CAMINHO);
}

export async function registrarPagamento(custoId: string, formData: FormData) {
  const usuario = await exigirSessao();

  const validado = esquemaPagamento.safeParse({
    valorPago: formData.get("valorPago"),
  });

  if (!validado.success) return;

  await salvarValorPago(custoId, usuario.casamentoId, validado.data.valorPago);
  revalidatePath(CAMINHO);
}

export async function arquivarCusto(id: string) {
  const usuario = await exigirSessao();
  await removerParcelas(id, usuario.casamentoId);
  await arquivar(id, usuario.casamentoId);
  revalidatePath(CAMINHO);
}

export type EstadoOrcamento = { erro?: string } | undefined;

export async function salvarOrcamentoCategoria(
  _estado: EstadoOrcamento,
  formData: FormData
): Promise<EstadoOrcamento> {
  const usuario = await exigirSessao();

  const validado = esquemaOrcamento.safeParse({
    categoria: formData.get("categoria"),
    valor: formData.get("valor"),
  });
  if (!validado.success) {
    return { erro: "Informe a categoria e um valor válido." };
  }

  await definirOrcamento(
    usuario.casamentoId,
    validado.data.categoria,
    validado.data.valor
  );
  revalidatePath(CAMINHO);
}

export type EstadoParcelamento = { erro?: string } | undefined;

export async function parcelarCusto(
  custoId: string,
  _estado: EstadoParcelamento,
  formData: FormData
): Promise<EstadoParcelamento> {
  const usuario = await exigirSessao();

  const validado = esquemaParcelamento.safeParse({
    numero: formData.get("numero"),
    primeiroVencimento: formData.get("primeiroVencimento"),
  });
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }

  const custo = await buscarCustoPorId(custoId, usuario.casamentoId);
  if (!custo || !custo.valor_centavos) {
    return { erro: "Defina o valor do custo antes de parcelar." };
  }

  const { numero, primeiroVencimento } = validado.data;
  const valores = dividirEmParcelas(custo.valor_centavos, numero);
  const datas = datasMensais(primeiroVencimento, numero);

  await substituirParcelas(
    custoId,
    usuario.casamentoId,
    valores.map((valorCentavos, i) => ({
      valorCentavos,
      vencimento: datas[i],
    }))
  );
  revalidatePath(CAMINHO);
}

export async function desfazerParcelamento(custoId: string) {
  const usuario = await exigirSessao();
  await removerParcelas(custoId, usuario.casamentoId);
  revalidatePath(CAMINHO);
}

export async function marcarParcela(parcelaId: string) {
  const usuario = await exigirSessao();
  await alternarParcelaPaga(parcelaId, usuario.casamentoId);
  revalidatePath(CAMINHO);
  revalidatePath("/painel");
}
