"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { esquemaDefinirSenha } from "@/lib/validacao/cadastro";
import {
  buscarUsuarioPorTokenDefinirSenha,
  definirSenhaInicial,
} from "@/lib/db/queries/usuarios";

export type EstadoDefinirSenha = { erro?: string } | undefined;

export async function definirSenha(
  token: string,
  _estado: EstadoDefinirSenha,
  formData: FormData
): Promise<EstadoDefinirSenha> {
  const validado = esquemaDefinirSenha.safeParse({
    senha: formData.get("senha"),
  });

  if (!validado.success) {
    return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const usuario = await buscarUsuarioPorTokenDefinirSenha(token);
  if (!usuario) {
    return { erro: "Link inválido ou já usado." };
  }

  if (
    usuario.token_definir_senha_expira_em &&
    new Date(usuario.token_definir_senha_expira_em) < new Date()
  ) {
    return { erro: "Esse link expirou." };
  }

  const senhaHash = await bcrypt.hash(validado.data.senha, 10);
  await definirSenhaInicial(usuario.id, senhaHash);

  try {
    await signIn("credentials", {
      email: usuario.email,
      senha: validado.data.senha,
      redirectTo: "/painel",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        erro: "Senha salva, mas não foi possível entrar automaticamente. Faça login.",
      };
    }
    throw err;
  }
}
