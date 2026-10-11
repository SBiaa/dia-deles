import { pool } from "../pool";
import type { CasamentoRow } from "./casamentos";

export type FotoRow = {
  id: string;
  casamento_id: string;
  url: string;
  nome_autor: string;
  status: "pendente" | "aprovada";
  criado_em: string;
};

export async function buscarCasamentoPorGaleriaToken(
  token: string
): Promise<CasamentoRow | null> {
  const { rows } = await pool.query<CasamentoRow>(
    "select * from casamentos where galeria_token = $1",
    [token]
  );
  return rows[0] ?? null;
}

export async function listarFotosPainel(
  casamentoId: string
): Promise<FotoRow[]> {
  const { rows } = await pool.query<FotoRow>(
    `select id, casamento_id, url, nome_autor, status, criado_em
     from fotos where casamento_id = $1
     order by criado_em desc, id desc`,
    [casamentoId]
  );
  return rows;
}

export async function listarFotosAprovadas(
  casamentoId: string
): Promise<FotoRow[]> {
  const { rows } = await pool.query<FotoRow>(
    `select id, casamento_id, url, nome_autor, status, criado_em
     from fotos where casamento_id = $1 and status = 'aprovada'
     order by criado_em desc, id desc
     limit 300`,
    [casamentoId]
  );
  return rows;
}

export async function criarFoto(dados: {
  casamentoId: string;
  url: string;
  nomeAutor: string;
  status: "pendente" | "aprovada";
}): Promise<FotoRow> {
  const { rows } = await pool.query<FotoRow>(
    `insert into fotos (casamento_id, url, nome_autor, status)
     values ($1, $2, $3, $4)
     returning id, casamento_id, url, nome_autor, status, criado_em`,
    [dados.casamentoId, dados.url, dados.nomeAutor, dados.status]
  );
  return rows[0];
}

export async function aprovarFoto(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "update fotos set status = 'aprovada' where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}

export async function aprovarTodasPendentes(
  casamentoId: string
): Promise<void> {
  await pool.query(
    "update fotos set status = 'aprovada' where casamento_id = $1 and status = 'pendente'",
    [casamentoId]
  );
}

/** Remove a foto e devolve a URL, para o arquivo também ser apagado. */
export async function removerFoto(
  id: string,
  casamentoId: string
): Promise<string | null> {
  const { rows } = await pool.query<{ url: string }>(
    "delete from fotos where id = $1 and casamento_id = $2 returning url",
    [id, casamentoId]
  );
  return rows[0]?.url ?? null;
}

export async function definirTokenGaleria(
  casamentoId: string,
  token: string | null
): Promise<void> {
  await pool.query(
    "update casamentos set galeria_token = $2, atualizado_em = now() where id = $1",
    [casamentoId, token]
  );
}

export async function definirModeracaoGaleria(
  casamentoId: string,
  moderada: boolean
): Promise<void> {
  await pool.query(
    "update casamentos set galeria_moderada = $2, atualizado_em = now() where id = $1",
    [casamentoId, moderada]
  );
}
