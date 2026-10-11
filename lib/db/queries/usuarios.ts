import { pool } from "../pool";

export type UsuarioRow = {
  id: string;
  email: string;
  senha_hash: string | null;
  nome: string;
  token_definir_senha: string | null;
  token_definir_senha_expira_em: string | null;
  criado_em: string;
  atualizado_em: string;
};

export async function buscarUsuarioPorEmail(
  email: string
): Promise<UsuarioRow | null> {
  const { rows } = await pool.query<UsuarioRow>(
    "select * from usuarios where email = $1",
    [email.toLowerCase().trim()]
  );
  return rows[0] ?? null;
}

export async function buscarUsuarioPorId(
  id: string
): Promise<UsuarioRow | null> {
  const { rows } = await pool.query<UsuarioRow>(
    "select * from usuarios where id = $1",
    [id]
  );
  return rows[0] ?? null;
}

export async function criarUsuario(dados: {
  email: string;
  nome: string;
  tokenDefinirSenha: string;
}): Promise<UsuarioRow> {
  const { rows } = await pool.query<UsuarioRow>(
    `insert into usuarios (email, nome, token_definir_senha, token_definir_senha_expira_em)
     values ($1, $2, $3, now() + interval '2 days')
     returning *`,
    [dados.email.toLowerCase().trim(), dados.nome.trim(), dados.tokenDefinirSenha]
  );
  return rows[0];
}

export async function atualizarSenhaUsuario(
  usuarioId: string,
  senhaHash: string
): Promise<void> {
  await pool.query(
    "update usuarios set senha_hash = $2, atualizado_em = now() where id = $1",
    [usuarioId, senhaHash]
  );
}

export async function buscarUsuarioPorTokenDefinirSenha(
  token: string
): Promise<UsuarioRow | null> {
  const { rows } = await pool.query<UsuarioRow>(
    "select * from usuarios where token_definir_senha = $1",
    [token]
  );
  return rows[0] ?? null;
}

export async function definirSenhaInicial(
  usuarioId: string,
  senhaHash: string
): Promise<void> {
  await pool.query(
    `update usuarios set
       senha_hash = $2,
       token_definir_senha = null,
       token_definir_senha_expira_em = null,
       atualizado_em = now()
     where id = $1`,
    [usuarioId, senhaHash]
  );
}
