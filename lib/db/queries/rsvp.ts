import { pool } from "../pool";

export type RsvpRow = {
  id: string;
  casamento_id: string;
  nome_convidado: string;
  email: string | null;
  telefone: string | null;
  confirmado: boolean;
  numero_acompanhantes: number;
  nomes_acompanhantes: string | null;
  mensagem: string | null;
  ip_origem: string | null;
  criado_em: string;
};

export async function criarRsvp(dados: {
  casamentoId: string;
  nomeConvidado: string;
  email: string | null;
  telefone: string | null;
  confirmado: boolean;
  numeroAcompanhantes: number;
  nomesAcompanhantes: string | null;
  mensagem: string | null;
  ipOrigem: string | null;
}): Promise<RsvpRow> {
  const { rows } = await pool.query<RsvpRow>(
    `insert into rsvps
      (casamento_id, nome_convidado, email, telefone, confirmado, numero_acompanhantes, nomes_acompanhantes, mensagem, ip_origem)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning *`,
    [
      dados.casamentoId,
      dados.nomeConvidado,
      dados.email,
      dados.telefone,
      dados.confirmado,
      dados.numeroAcompanhantes,
      dados.nomesAcompanhantes,
      dados.mensagem,
      dados.ipOrigem,
    ]
  );
  return rows[0];
}

export async function listarRsvpsPorCasamento(
  casamentoId: string
): Promise<RsvpRow[]> {
  const { rows } = await pool.query<RsvpRow>(
    "select * from rsvps where casamento_id = $1 order by criado_em desc",
    [casamentoId]
  );
  return rows;
}

export async function contarRsvpsRecentesPorIp(
  casamentoId: string,
  ip: string,
  janelaMinutos: number
): Promise<number> {
  const { rows } = await pool.query<{ total: string }>(
    `select count(*)::text as total from rsvps
     where casamento_id = $1 and ip_origem = $2
       and criado_em > now() - ($3 || ' minutes')::interval`,
    [casamentoId, ip, janelaMinutos]
  );
  return Number(rows[0]?.total ?? 0);
}
