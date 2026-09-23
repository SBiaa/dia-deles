"use server";

import bcrypt from "bcryptjs";
import { exigirSessao } from "@/lib/dal";
import { esquemaTrocarSlug, esquemaTrocarSenha } from "@/lib/validacao/configuracoes";
import { slugValido } from "@/lib/slugs";
import {
  atualizarSlug,
  existeSlugParaOutroCasamento,
} from "@/lib/db/queries/casamentos";
import {
  atualizarSenhaUsuario,
  buscarUsuarioPorId,
} from "@/lib/db/queries/usuarios";

export type EstadoConfiguracoes =
  | { erro?: string; sucesso?: string }
  | undefined;

export async function trocarSlug(
  _estado: EstadoConfiguracoes,
  formData: FormData
): Promise<EstadoConfiguracoes> {
  const usuario = await exigirSessao();

  const validado = esquemaTrocarSlug.safeParse({ slug: formData.get("slug") });
  if (!validado.success) {
    return { erro: "Endereço inválido." };
  }

  const slug = validado.data.slug;
  if (!slugValido(slug)) {
    return { erro: "Esse endereço não pode ser usado." };
  }

  if (await existeSlugParaOutroCasamento(slug, usuario.casamentoId)) {
    return { erro: "Esse endereço já está em uso." };
  }

  await atualizarSlug(usuario.casamentoId, slug);
  return { sucesso: `Endereço atualizado para /${slug}.` };
}

export async function trocarSenha(
  _estado: EstadoConfiguracoes,
  formData: FormData
): Promise<EstadoConfiguracoes> {
  const usuario = await exigirSessao();

  const validado = esquemaTrocarSenha.safeParse({
    senhaAtual: formData.get("senhaAtual"),
    senhaNova: formData.get("senhaNova"),
  });
  if (!validado.success) {
    return { erro: "Confira os campos preenchidos." };
  }

  const registro = await buscarUsuarioPorId(usuario.id);
  if (!registro) {
    return { erro: "Usuário não encontrado." };
  }

  const ok = await bcrypt.compare(validado.data.senhaAtual, registro.senha_hash);
  if (!ok) {
    return { erro: "Senha atual incorreta." };
  }

  const novoHash = await bcrypt.hash(validado.data.senhaNova, 10);
  await atualizarSenhaUsuario(registro.id, novoHash);

  return { sucesso: "Senha atualizada." };
}
