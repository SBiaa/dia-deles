import { pool } from "../pool";

export type TarefaRow = {
  id: string;
  casamento_id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  concluida: boolean;
  ordem: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
};

export async function criarTarefa(dados: {
  casamentoId: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
}): Promise<TarefaRow> {
  const { rows } = await pool.query<TarefaRow>(
    `insert into tarefas (casamento_id, titulo, descricao, prazo)
     values ($1, $2, $3, $4)
     returning *`,
    [dados.casamentoId, dados.titulo, dados.descricao, dados.prazo]
  );
  return rows[0];
}

export async function listarTarefasPainel(
  casamentoId: string
): Promise<TarefaRow[]> {
  const { rows } = await pool.query<TarefaRow>(
    `select * from tarefas
     where casamento_id = $1 and ativo = true
     order by concluida asc, prazo asc nulls last, criado_em asc`,
    [casamentoId]
  );
  return rows;
}

export async function definirConclusao(
  id: string,
  casamentoId: string,
  concluida: boolean
): Promise<void> {
  await pool.query(
    `update tarefas set concluida = $3, atualizado_em = now()
     where id = $1 and casamento_id = $2`,
    [id, casamentoId, concluida]
  );
}

export async function arquivarTarefa(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "update tarefas set ativo = false, atualizado_em = now() where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}

/** Insere várias tarefas de uma vez, ignorando títulos que já existem. */
export async function inserirTarefasSugeridas(
  casamentoId: string,
  tarefas: { titulo: string; descricao: string; prazo: string }[]
): Promise<number> {
  if (tarefas.length === 0) return 0;
  const { rowCount } = await pool.query(
    `insert into tarefas (casamento_id, titulo, descricao, prazo)
     select $1, t.titulo, t.descricao, t.prazo::date
     from unnest($2::text[], $3::text[], $4::text[]) as t(titulo, descricao, prazo)
     where not exists (
       select 1 from tarefas x
       where x.casamento_id = $1 and x.ativo = true
         and lower(x.titulo) = lower(t.titulo)
     )`,
    [
      casamentoId,
      tarefas.map((t) => t.titulo),
      tarefas.map((t) => t.descricao),
      tarefas.map((t) => t.prazo),
    ]
  );
  return rowCount ?? 0;
}
