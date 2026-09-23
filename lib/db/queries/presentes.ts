import { pool } from "../pool";

export type PresenteRow = {
  id: string;
  casamento_id: string;
  nome: string;
  descricao: string | null;
  preco_centavos: number | null;
  imagem_url: string | null;
  ordem: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
};

export type ReservaRow = {
  id: string;
  presente_id: string;
  nome_convidado: string;
  email_convidado: string | null;
  mensagem: string | null;
  criado_em: string;
  cancelado_em: string | null;
};

export type PresenteComReserva = PresenteRow & {
  reserva: ReservaRow | null;
};

const CAMPOS_RESERVA_ATIVA = `
  (
    select to_jsonb(pr) from presente_reservas pr
    where pr.presente_id = p.id and pr.cancelado_em is null
    limit 1
  ) as reserva
`;

export async function criarPresente(dados: {
  casamentoId: string;
  nome: string;
  descricao: string | null;
  precoCentavos: number | null;
  imagemUrl: string | null;
}): Promise<PresenteRow> {
  const { rows } = await pool.query<PresenteRow>(
    `insert into presentes (casamento_id, nome, descricao, preco_centavos, imagem_url)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [
      dados.casamentoId,
      dados.nome,
      dados.descricao,
      dados.precoCentavos,
      dados.imagemUrl,
    ]
  );
  return rows[0];
}

export async function listarPresentesPainel(
  casamentoId: string
): Promise<PresenteComReserva[]> {
  const { rows } = await pool.query<PresenteComReserva>(
    `select p.*, ${CAMPOS_RESERVA_ATIVA}
     from presentes p
     where p.casamento_id = $1
     order by p.ordem asc, p.criado_em asc`,
    [casamentoId]
  );
  return rows;
}

export async function listarPresentesPublico(
  casamentoId: string
): Promise<PresenteComReserva[]> {
  const { rows } = await pool.query<PresenteComReserva>(
    `select p.*, ${CAMPOS_RESERVA_ATIVA}
     from presentes p
     where p.casamento_id = $1 and p.ativo = true
     order by p.ordem asc, p.criado_em asc`,
    [casamentoId]
  );
  return rows;
}

export async function buscarPresentePorId(
  id: string
): Promise<PresenteRow | null> {
  const { rows } = await pool.query<PresenteRow>(
    "select * from presentes where id = $1",
    [id]
  );
  return rows[0] ?? null;
}

export async function arquivarPresente(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "update presentes set ativo = false, atualizado_em = now() where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}

export class PresenteJaReservadoError extends Error {
  constructor() {
    super("Este presente já foi reservado por alguém.");
  }
}

export async function criarReserva(dados: {
  presenteId: string;
  nomeConvidado: string;
  emailConvidado: string | null;
  mensagem: string | null;
}): Promise<ReservaRow> {
  try {
    const { rows } = await pool.query<ReservaRow>(
      `insert into presente_reservas (presente_id, nome_convidado, email_convidado, mensagem)
       values ($1, $2, $3, $4)
       returning *`,
      [
        dados.presenteId,
        dados.nomeConvidado,
        dados.emailConvidado,
        dados.mensagem,
      ]
    );
    return rows[0];
  } catch (err) {
    const codigo = (err as { code?: string } | null)?.code;
    if (codigo === "23505") {
      throw new PresenteJaReservadoError();
    }
    throw err;
  }
}

export async function cancelarReserva(
  reservaId: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    `update presente_reservas pr
     set cancelado_em = now()
     from presentes p
     where pr.id = $1 and pr.presente_id = p.id and p.casamento_id = $2`,
    [reservaId, casamentoId]
  );
}
