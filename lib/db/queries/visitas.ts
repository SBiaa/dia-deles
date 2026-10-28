import { pool } from "../pool";

export async function registrarVisita(dados: {
  visitanteId: string;
  usuarioId: string | null;
  caminho: string;
  origem: string | null;
}): Promise<void> {
  await pool.query(
    `insert into visitas (visitante_id, usuario_id, caminho, origem)
     values ($1, $2, $3, $4)`,
    [dados.visitanteId, dados.usuarioId, dados.caminho, dados.origem]
  );
  if (dados.usuarioId) {
    await pool.query(
      "update usuarios set ultimo_acesso_em = now() where id = $1",
      [dados.usuarioId]
    );
  }
}

export async function registrarOrigemUsuario(
  usuarioId: string,
  visitanteId: string | null,
  origem: string | null
): Promise<void> {
  await pool.query(
    "update usuarios set visitante_id = $2, origem = $3 where id = $1",
    [usuarioId, visitanteId, origem]
  );
}
