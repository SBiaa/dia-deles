import { pool } from "../pool";

export type ConvidadoRow = {
  id: string;
  casamento_id: string;
  nome: string;
  lado: string | null;
  telefone: string | null;
  limite_acompanhantes: number;
  codigo: string;
  confirmado: boolean | null;
  numero_acompanhantes: number;
  nomes_acompanhantes: string | null;
  restricao_alimentar: string | null;
  mensagem: string | null;
  respondido_em: string | null;
  criado_em: string;
  atualizado_em: string;
};

export async function existeCodigoConvite(codigo: string): Promise<boolean> {
  const { rows } = await pool.query("select 1 from convidados where codigo = $1", [
    codigo,
  ]);
  return rows.length > 0;
}

export async function criarConvidado(dados: {
  casamentoId: string;
  nome: string;
  lado: string | null;
  telefone: string | null;
  limiteAcompanhantes: number;
  codigo: string;
}): Promise<ConvidadoRow> {
  const { rows } = await pool.query<ConvidadoRow>(
    `insert into convidados (casamento_id, nome, lado, telefone, limite_acompanhantes, codigo)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [
      dados.casamentoId,
      dados.nome,
      dados.lado,
      dados.telefone,
      dados.limiteAcompanhantes,
      dados.codigo,
    ]
  );
  return rows[0];
}

export async function listarConvidadosPorCasamento(
  casamentoId: string
): Promise<ConvidadoRow[]> {
  const { rows } = await pool.query<ConvidadoRow>(
    "select * from convidados where casamento_id = $1 order by criado_em asc",
    [casamentoId]
  );
  return rows;
}

export async function buscarConvidadoPorCodigo(
  codigo: string
): Promise<ConvidadoRow | null> {
  const { rows } = await pool.query<ConvidadoRow>(
    "select * from convidados where codigo = $1",
    [codigo]
  );
  return rows[0] ?? null;
}

export async function registrarResposta(
  codigo: string,
  dados: {
    confirmado: boolean;
    numeroAcompanhantes: number;
    nomesAcompanhantes: string | null;
    restricaoAlimentar: string | null;
    mensagem: string | null;
  }
): Promise<ConvidadoRow | null> {
  const { rows } = await pool.query<ConvidadoRow>(
    `update convidados set
       confirmado = $2,
       numero_acompanhantes = $3,
       nomes_acompanhantes = $4,
       restricao_alimentar = $5,
       mensagem = $6,
       respondido_em = now(),
       atualizado_em = now()
     where codigo = $1
     returning *`,
    [
      codigo,
      dados.confirmado,
      dados.numeroAcompanhantes,
      dados.nomesAcompanhantes,
      dados.restricaoAlimentar,
      dados.mensagem,
    ]
  );
  return rows[0] ?? null;
}

export async function marcarConfirmadoManual(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    `update convidados set confirmado = true, respondido_em = now(), atualizado_em = now()
     where id = $1 and casamento_id = $2`,
    [id, casamentoId]
  );
}

export async function removerConvidado(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "delete from convidados where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}
