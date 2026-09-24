"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { esquemaTarefa } from "@/lib/validacao/tarefas";
import {
  criarTarefa as salvarTarefa,
  definirConclusao,
  arquivarTarefa as arquivar,
} from "@/lib/db/queries/tarefas";

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
