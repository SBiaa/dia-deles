"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { esquemaTarefa } from "@/lib/validacao/tarefas";
import {
  criarTarefa as salvarTarefa,
  definirConclusao,
  arquivarTarefa as arquivar,
  inserirTarefasSugeridas,
} from "@/lib/db/queries/tarefas";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { hojeIso } from "@/lib/datas";
import { sugerirTarefas } from "@/lib/tarefas-modelo";

export type EstadoFormularioTarefa = { erro?: string } | undefined;

export async function criarTarefa(
  _estado: EstadoFormularioTarefa,
  formData: FormData
): Promise<EstadoFormularioTarefa> {
  const usuario = await exigirSessao();

  const validado = esquemaTarefa.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    prazo: formData.get("prazo"),
  });

  if (!validado.success) {
    return { erro: "Confira os campos preenchidos." };
  }

  await salvarTarefa({
    casamentoId: usuario.casamentoId,
    titulo: validado.data.titulo,
    descricao: validado.data.descricao,
    prazo: validado.data.prazo,
  });

  revalidatePath("/painel/tarefas");
}

export async function concluirTarefa(id: string) {
  const usuario = await exigirSessao();
  await definirConclusao(id, usuario.casamentoId, true);
  revalidatePath("/painel/tarefas");
}

export async function reabrirTarefa(id: string) {
  const usuario = await exigirSessao();
  await definirConclusao(id, usuario.casamentoId, false);
  revalidatePath("/painel/tarefas");
}

export async function arquivarTarefa(id: string) {
  const usuario = await exigirSessao();
  await arquivar(id, usuario.casamentoId);
  revalidatePath("/painel/tarefas");
}

export type EstadoChecklistSugerido =
  | { erro?: string; adicionadas?: number }
  | undefined;

export async function gerarChecklistSugerido(
  _estado: EstadoChecklistSugerido
): Promise<EstadoChecklistSugerido> {
  const usuario = await exigirSessao();
  const casamento = await buscarCasamentoPorId(usuario.casamentoId);

  if (!casamento?.data_casamento) {
    return { erro: "Defina a data do casamento em Meu site primeiro." };
  }

  const sugeridas = sugerirTarefas(casamento.data_casamento, hojeIso());
  const adicionadas = await inserirTarefasSugeridas(
    usuario.casamentoId,
    sugeridas
  );

  revalidatePath("/painel/tarefas");
  return { adicionadas };
}
