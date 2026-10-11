import { pool } from "../pool";

export type ItemCronogramaRow = {
  id: string;
  casamento_id: string;
  horario: string; // HH:MM:SS
  titulo: string;
  descricao: string | null;
  local: string | null;
  responsavel: string | null;
};

const CAMPOS = "id, casamento_id, horario, titulo, descricao, local, responsavel";

export async function listarCronograma(
  casamentoId: string
): Promise<ItemCronogramaRow[]> {
  const { rows } = await pool.query<ItemCronogramaRow>(
    `select ${CAMPOS} from cronograma_itens
     where casamento_id = $1
     order by horario asc, id asc`,
    [casamentoId]
  );
  return rows;
}

export async function criarItemCronograma(dados: {
  casamentoId: string;
  horario: string;
  titulo: string;
  descricao: string | null;
  local: string | null;
  responsavel: string | null;
}): Promise<void> {
  await pool.query(
    `insert into cronograma_itens
       (casamento_id, horario, titulo, descricao, local, responsavel)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      dados.casamentoId,
      dados.horario,
      dados.titulo,
      dados.descricao,
      dados.local,
      dados.responsavel,
    ]
  );
}

export async function atualizarItemCronograma(
  id: string,
  casamentoId: string,
  dados: {
    horario: string;
    titulo: string;
    descricao: string | null;
    local: string | null;
    responsavel: string | null;
  }
): Promise<void> {
  await pool.query(
    `update cronograma_itens set
       horario = $3, titulo = $4, descricao = $5, local = $6,
       responsavel = $7, atualizado_em = now()
     where id = $1 and casamento_id = $2`,
    [
      id,
      casamentoId,
      dados.horario,
      dados.titulo,
      dados.descricao,
      dados.local,
      dados.responsavel,
    ]
  );
}

export async function removerItemCronograma(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "delete from cronograma_itens where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}

/** Insere o roteiro sugerido, ignorando itens com o mesmo título e horário. */
export async function inserirItensSugeridos(
  casamentoId: string,
  itens: {
    horario: string;
    titulo: string;
    descricao: string | null;
    local: string | null;
    responsavel: string | null;
  }[]
): Promise<number> {
  if (itens.length === 0) return 0;
  const { rowCount } = await pool.query(
    `insert into cronograma_itens
       (casamento_id, horario, titulo, descricao, local, responsavel)
     select $1, t.horario::time, t.titulo, t.descricao, t.local, t.responsavel
     from unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::text[])
       as t(horario, titulo, descricao, local, responsavel)
     where not exists (
       select 1 from cronograma_itens x
       where x.casamento_id = $1
         and lower(x.titulo) = lower(t.titulo)
         and x.horario = t.horario::time
     )`,
    [
      casamentoId,
      itens.map((i) => i.horario),
      itens.map((i) => i.titulo),
      itens.map((i) => i.descricao),
      itens.map((i) => i.local),
      itens.map((i) => i.responsavel),
    ]
  );
  return rowCount ?? 0;
}

export async function definirTokenCronograma(
  casamentoId: string,
  token: string | null
): Promise<void> {
  await pool.query(
    "update casamentos set cronograma_token = $2, atualizado_em = now() where id = $1",
    [casamentoId, token]
  );
}

export async function buscarTokenCronograma(
  casamentoId: string
): Promise<string | null> {
  const { rows } = await pool.query<{ cronograma_token: string | null }>(
    "select cronograma_token from casamentos where id = $1",
    [casamentoId]
  );
  return rows[0]?.cronograma_token ?? null;
}
