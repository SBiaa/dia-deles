"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { exigirSessao } from "@/lib/dal";
import {
  aprovarFoto as aprovar,
  aprovarTodasPendentes,
  definirModeracaoGaleria,
  definirTokenGaleria,
  removerFoto as remover,
} from "@/lib/db/queries/galeria";
import { gerarTokenCompartilhamento } from "@/lib/tokens";

const CAMINHO = "/painel/galeria";

export async function abrirGaleria() {
  const usuario = await exigirSessao();
  await definirTokenGaleria(usuario.casamentoId, gerarTokenCompartilhamento());
  revalidatePath(CAMINHO);
}

export async function fecharGaleria() {
  const usuario = await exigirSessao();
  await definirTokenGaleria(usuario.casamentoId, null);
  revalidatePath(CAMINHO);
}

export async function alternarModeracao(moderada: boolean) {
  const usuario = await exigirSessao();
  await definirModeracaoGaleria(usuario.casamentoId, moderada);
  revalidatePath(CAMINHO);
}

export async function aprovarFoto(id: string) {
  const usuario = await exigirSessao();
  await aprovar(id, usuario.casamentoId);
  revalidatePath(CAMINHO);
}

export async function aprovarTodas() {
  const usuario = await exigirSessao();
  await aprovarTodasPendentes(usuario.casamentoId);
  revalidatePath(CAMINHO);
}

export async function removerFoto(id: string) {
  const usuario = await exigirSessao();
  const url = await remover(id, usuario.casamentoId);
  if (url) {
    try {
      await del(url);
    } catch {
      // Se o arquivo não puder ser apagado agora, a foto some da galeria mesmo assim.
    }
  }
  revalidatePath(CAMINHO);
}
