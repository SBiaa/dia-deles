"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import {
  esquemaEditarMesa,
  esquemaNovasMesas,
} from "@/lib/validacao/mesas";
import {
  atribuirMesas,
  atualizarMesa,
  criarMesas as salvarMesas,
  limparTodasAsMesas,
  listarMesas,
  moverConvidadoParaMesa,
  removerMesa as remover,
} from "@/lib/db/queries/mesas";
import { listarConvidadosPorCasamento } from "@/lib/db/queries/convidados";
import {
  convidadosParaMesas,
  distribuirAutomaticamente as distribuir,
} from "@/lib/mesas";

export type EstadoFormularioMesa = { erro?: string } | undefined;

const CAMINHO = "/painel/mesas";

export async function criarMesas(
  _estado: EstadoFormularioMesa,
  formData: FormData
): Promise<EstadoFormularioMesa> {
  const usuario = await exigirSessao();

  const validado = esquemaNovasMesas.safeParse({
    nome: formData.get("nome"),
    capacidade: formData.get("capacidade"),
    quantidade: formData.get("quantidade"),
  });
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }

  await salvarMesas({
    casamentoId: usuario.casamentoId,
    nome: validado.data.nome,
    capacidade: validado.data.capacidade,
    quantidade: validado.data.quantidade,
  });
  revalidatePath(CAMINHO);
}

export async function editarMesa(
  id: string,
  _estado: EstadoFormularioMesa,
  formData: FormData
): Promise<EstadoFormularioMesa> {
  const usuario = await exigirSessao();

  const validado = esquemaEditarMesa.safeParse({
    nome: formData.get("nome"),
    capacidade: formData.get("capacidade"),
  });
  if (!validado.success) {
    return { erro: validado.error.issues[0]?.message ?? "Confira os campos." };
  }

  await atualizarMesa(id, usuario.casamentoId, validado.data);
  revalidatePath(CAMINHO);
}

export async function removerMesa(id: string) {
  const usuario = await exigirSessao();
  await remover(id, usuario.casamentoId);
  revalidatePath(CAMINHO);
}

export async function moverConvidado(
  convidadoId: string,
  mesaId: string | null
) {
  const usuario = await exigirSessao();
  await moverConvidadoParaMesa(convidadoId, usuario.casamentoId, mesaId);
  revalidatePath(CAMINHO);
}

export async function distribuirAutomaticamente() {
  const usuario = await exigirSessao();
  const [mesas, convidados] = await Promise.all([
    listarMesas(usuario.casamentoId),
    listarConvidadosPorCasamento(usuario.casamentoId),
  ]);
  const atribuicoes = distribuir(mesas, convidadosParaMesas(convidados));
  await atribuirMesas(usuario.casamentoId, atribuicoes);
  revalidatePath(CAMINHO);
}

export async function limparMesas() {
  const usuario = await exigirSessao();
  await limparTodasAsMesas(usuario.casamentoId);
  revalidatePath(CAMINHO);
}
