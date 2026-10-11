import { pool } from "../pool";

export type MesaRow = {
  id: string;
  casamento_id: string;
  nome: string;
  capacidade: number;
  ordem: number;
};

export async function listarMesas(casamentoId: string): Promise<MesaRow[]> {
  const { rows } = await pool.query<MesaRow>(
    `select id, casamento_id, nome, capacidade, ordem
     from mesas
     where casamento_id = $1
     order by ordem asc, id asc`,
    [casamentoId]
  );
  return rows;
}

/** Cria N mesas numeradas a partir da próxima ordem disponível. */
export async function criarMesas(dados: {
  casamentoId: string;
  nome: string | null;
  capacidade: number;
  quantidade: number;
}): Promise<void> {
  const { rows } = await pool.query<{ proxima: number }>(
    "select coalesce(max(ordem), 0) + 1 as proxima from mesas where casamento_id = $1",
    [dados.casamentoId]
  );
  const inicio = Number(rows[0]?.proxima ?? 1);

  for (let i = 0; i < dados.quantidade; i++) {
    const ordem = inicio + i;
    const nome =
      dados.nome && dados.quantidade === 1
        ? dados.nome
        : `${dados.nome ?? "Mesa"} ${ordem}`;
    await pool.query(
      `insert into mesas (casamento_id, nome, capacidade, ordem)
       values ($1, $2, $3, $4)`,
      [dados.casamentoId, nome, dados.capacidade, ordem]
    );
  }
}

export async function atualizarMesa(
  id: string,
  casamentoId: string,
  dados: { nome: string; capacidade: number }
): Promise<void> {
  await pool.query(
    `update mesas set nome = $3, capacidade = $4, atualizado_em = now()
     where id = $1 and casamento_id = $2`,
    [id, casamentoId, dados.nome, dados.capacidade]
  );
}

export async function removerMesa(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query("delete from mesas where id = $1 and casamento_id = $2", [
    id,
    casamentoId,
  ]);
}

/** Move o convidado para a mesa (ou para "sem mesa" com null). */
export async function moverConvidadoParaMesa(
  convidadoId: string,
  casamentoId: string,
  mesaId: string | null
): Promise<void> {
  await pool.query(
    `update convidados set mesa_id = $3, atualizado_em = now()
     where id = $1 and casamento_id = $2
       and ($3::bigint is null or exists (
         select 1 from mesas m where m.id = $3::bigint and m.casamento_id = $2
       ))`,
    [convidadoId, casamentoId, mesaId]
  );
}

export async function limparTodasAsMesas(casamentoId: string): Promise<void> {
  await pool.query(
    "update convidados set mesa_id = null where casamento_id = $1",
    [casamentoId]
  );
}

export async function atribuirMesas(
  casamentoId: string,
  atribuicoes: { convidadoId: string; mesaId: string }[]
): Promise<void> {
  if (atribuicoes.length === 0) return;
  await pool.query(
    `update convidados c set mesa_id = a.mesa_id, atualizado_em = now()
     from unnest($2::bigint[], $3::bigint[]) as a(convidado_id, mesa_id)
     where c.id = a.convidado_id and c.casamento_id = $1
       and exists (
         select 1 from mesas m where m.id = a.mesa_id and m.casamento_id = $1
       )`,
    [
      casamentoId,
      atribuicoes.map((a) => a.convidadoId),
      atribuicoes.map((a) => a.mesaId),
    ]
  );
}
