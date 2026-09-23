import { pool } from "../pool";

export type UsuarioRow = {
  id: string;
  email: string;
  senha_hash: string;
  nome: string;
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
  senhaHash: string;
  nome: string;
}): Promise<UsuarioRow> {
  const { rows } = await pool.query<UsuarioRow>(
    `insert into usuarios (email, senha_hash, nome)
     values ($1, $2, $3)
     returning *`,
    [dados.email.toLowerCase().trim(), dados.senhaHash, dados.nome.trim()]
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
