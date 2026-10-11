import { pool } from "../pool";

export type PadrinhoRow = {
  id: string;
  casamento_id: string;
  nome: string;
  papel: string;
  telefone: string | null;
  horario_chegada: string | null; // HH:MM:SS
  nota_pessoal: string | null;
  token: string;
  aceitou: boolean | null;
  respondido_em: string | null;
  resposta_mensagem: string | null;
  ordem: number;
};

export type SecaoManualRow = {
  id: string;
  casamento_id: string;
  titulo: string;
  texto: string;
  ordem: number;
};

const CAMPOS = `id, casamento_id, nome, papel, telefone, horario_chegada,
  nota_pessoal, token, aceitou, respondido_em, resposta_mensagem, ordem`;

export async function listarPadrinhos(
  casamentoId: string
): Promise<PadrinhoRow[]> {
  const { rows } = await pool.query<PadrinhoRow>(
    `select ${CAMPOS} from padrinhos
     where casamento_id = $1
     order by ordem asc, id asc`,
    [casamentoId]
  );
  return rows;
}

export async function buscarPadrinhoPorToken(
  token: string
): Promise<PadrinhoRow | null> {
  const { rows } = await pool.query<PadrinhoRow>(
    `select ${CAMPOS} from padrinhos where token = $1`,
    [token]
  );
  return rows[0] ?? null;
}

export async function criarPadrinho(dados: {
  casamentoId: string;
  nome: string;
  papel: string;
  telefone: string | null;
  horarioChegada: string | null;
  notaPessoal: string | null;
  token: string;
}): Promise<void> {
  await pool.query(
    `insert into padrinhos
       (casamento_id, nome, papel, telefone, horario_chegada, nota_pessoal, token,
        ordem)
     values ($1, $2, $3, $4, $5, $6, $7,
       (select coalesce(max(ordem), 0) + 1 from padrinhos where casamento_id = $1))`,
    [
      dados.casamentoId,
      dados.nome,
      dados.papel,
      dados.telefone,
      dados.horarioChegada,
      dados.notaPessoal,
      dados.token,
    ]
  );
}

export async function removerPadrinho(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "delete from padrinhos where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}

export async function registrarRespostaPadrinho(
  token: string,
  dados: { aceitou: boolean; mensagem: string | null }
): Promise<void> {
  await pool.query(
    `update padrinhos set aceitou = $2, resposta_mensagem = $3,
       respondido_em = now()
     where token = $1`,
    [token, dados.aceitou, dados.mensagem]
  );
}

export async function listarManual(
  casamentoId: string
): Promise<SecaoManualRow[]> {
  const { rows } = await pool.query<SecaoManualRow>(
    `select id, casamento_id, titulo, texto, ordem
     from padrinhos_manual
     where casamento_id = $1
     order by ordem asc, id asc`,
    [casamentoId]
  );
  return rows;
}

export async function criarSecaoManual(dados: {
  casamentoId: string;
  titulo: string;
  texto: string;
}): Promise<void> {
  await pool.query(
    `insert into padrinhos_manual (casamento_id, titulo, texto, ordem)
     values ($1, $2, $3,
       (select coalesce(max(ordem), 0) + 1 from padrinhos_manual where casamento_id = $1))`,
    [dados.casamentoId, dados.titulo, dados.texto]
  );
}

export async function atualizarSecaoManual(
  id: string,
  casamentoId: string,
  dados: { titulo: string; texto: string }
): Promise<void> {
  await pool.query(
    `update padrinhos_manual set titulo = $3, texto = $4
     where id = $1 and casamento_id = $2`,
    [id, casamentoId, dados.titulo, dados.texto]
  );
}

export async function removerSecaoManual(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "delete from padrinhos_manual where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}

/** Adiciona seções sugeridas que ainda não existem (pelo título). */
export async function inserirSecoesSugeridas(
  casamentoId: string,
  secoes: { titulo: string; texto: string }[]
): Promise<number> {
  const { rowCount } = await pool.query(
    `insert into padrinhos_manual (casamento_id, titulo, texto, ordem)
     select $1, t.titulo, t.texto,
       (select coalesce(max(ordem), 0) from padrinhos_manual where casamento_id = $1)
         + t.n
     from unnest($2::text[], $3::text[]) with ordinality as t(titulo, texto, n)
     where not exists (
       select 1 from padrinhos_manual x
       where x.casamento_id = $1 and lower(x.titulo) = lower(t.titulo)
     )`,
    [casamentoId, secoes.map((s) => s.titulo), secoes.map((s) => s.texto)]
  );
  return rowCount ?? 0;
}

export async function definirMensagemPadrinhos(
  casamentoId: string,
  mensagem: string | null
): Promise<void> {
  await pool.query(
    "update casamentos set padrinhos_mensagem = $2, atualizado_em = now() where id = $1",
    [casamentoId, mensagem]
  );
}
