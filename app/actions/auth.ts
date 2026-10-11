"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { esquemaCadastro, esquemaLogin } from "@/lib/validacao/cadastro";
import { buscarUsuarioPorEmail, criarUsuario } from "@/lib/db/queries/usuarios";
import { criarCasamento } from "@/lib/db/queries/casamentos";
import { gerarSlugDisponivel } from "@/lib/slugs";
import { gerarTokenDefinirSenha } from "@/lib/tokens";

export type EstadoFormularioAuth =
  | {
      erro?: string;
      camposInvalidos?: Record<string, string[] | undefined>;
    }
  | undefined;

export async function cadastrar(
  _estado: EstadoFormularioAuth,
  formData: FormData
): Promise<EstadoFormularioAuth> {
  const validado = esquemaCadastro.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    nomeParceiro1: formData.get("nomeParceiro1"),
    nomeParceiro2: formData.get("nomeParceiro2"),
    dataCasamento: formData.get("dataCasamento"),
  });

  if (!validado.success) {
    return { camposInvalidos: validado.error.flatten().fieldErrors };
  }

  const dados = validado.data;

  const existente = await buscarUsuarioPorEmail(dados.email);
  if (existente) {
    return { erro: "Já existe uma conta com esse e-mail." };
  }

  const token = gerarTokenDefinirSenha();
  const usuario = await criarUsuario({
    email: dados.email,
    nome: dados.nome,
    tokenDefinirSenha: token,
  });
  const slug = await gerarSlugDisponivel(dados.nomeParceiro1, dados.nomeParceiro2);
  await criarCasamento({
    usuarioId: usuario.id,
    slug,
    nomeParceiro1: dados.nomeParceiro1,
    nomeParceiro2: dados.nomeParceiro2,
    dataCasamento: dados.dataCasamento,
  });

  redirect(`/definir-senha/${token}`);
}

export async function entrar(
  _estado: EstadoFormularioAuth,
  formData: FormData
): Promise<EstadoFormularioAuth> {
  const validado = esquemaLogin.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!validado.success) {
    return { erro: "Informe e-mail e senha válidos." };
  }

  try {
    await signIn("credentials", {
      email: validado.data.email,
      senha: validado.data.senha,
      redirectTo: "/painel",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { erro: "E-mail ou senha inválidos." };
    }
    throw err;
  }
}

export async function sair() {
  await signOut({ redirectTo: "/" });
}
