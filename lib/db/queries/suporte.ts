import { pool } from "../pool";

export type TipoChamado = "bug" | "duvida" | "sugestao" | "outro";
export type StatusChamado = "aberto" | "em_andamento" | "resolvido";

export type ChamadoRow = {
  id: string;
  usuario_id: string | null;
  nome: string;
  email: string;
  tipo: TipoChamado;
  assunto: string;
  status: StatusChamado;
  navegador: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type MensagemRow = {
  id: string;
  chamado_id: string;
  autor: "casal" | "admin";
  texto: string;
  criado_em: string;
};

export type ChamadoComUltima = ChamadoRow & {
  ultima_autor: "casal" | "admin" | null;
};

export async function criarChamado(dados: {
  usuarioId: string | null;
  nome: string;
  email: string;
  tipo: TipoChamado;
  assunto: string;
  texto: string;
  navegador: string | null;
}): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ id: string }>(
      `insert into suporte_chamados (usuario_id, nome, email, tipo, assunto, navegador)
       values ($1, $2, $3, $4, $5, $6) returning id`,
      [
        dados.usuarioId,
        dados.nome,
        dados.email.toLowerCase(),
        dados.tipo,
        dados.assunto,
        dados.navegador,
      ]
    );
    await client.query(
      "insert into suporte_mensagens (chamado_id, autor, texto) values ($1, 'casal', $2)",
      [rows[0].id, dados.texto]
    );
    await client.query("commit");
    return rows[0].id;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

/** Quantos chamados esse e-mail abriu na última hora (limite anti-spam). */
export async function contarChamadosRecentes(email: string): Promise<number> {
  const { rows } = await pool.query<{ n: number }>(
    `select count(*)::int as n from suporte_chamados
     where email = $1 and criado_em > now() - interval '1 hour'`,
    [email.toLowerCase()]
  );
  return rows[0].n;
}

const SELECT_COM_ULTIMA = `
  select c.*,
    (select m.autor from suporte_mensagens m
      where m.chamado_id = c.id order by m.criado_em desc, m.id desc limit 1) as ultima_autor
  from suporte_chamados c`;

export async function listarChamadosDoUsuario(
  usuarioId: string
): Promise<ChamadoComUltima[]> {
  const { rows } = await pool.query<ChamadoComUltima>(
    `${SELECT_COM_ULTIMA} where c.usuario_id = $1 order by c.atualizado_em desc`,
    [usuarioId]
  );
  return rows;
}

export async function listarChamadosAdmin(
  status: StatusChamado | "todos"
): Promise<ChamadoComUltima[]> {
  const { rows } = await pool.query<ChamadoComUltima>(
    `${SELECT_COM_ULTIMA}
     where ($1 = 'todos' or c.status = $1)
     order by (c.status = 'resolvido'), c.atualizado_em desc
     limit 200`,
    [status]
  );
  return rows;
}

export async function contarChamadosPorStatus(): Promise<
  Record<StatusChamado, number>
> {
  const { rows } = await pool.query<{ status: StatusChamado; n: number }>(
    "select status, count(*)::int as n from suporte_chamados group by status"
  );
  const resultado = { aberto: 0, em_andamento: 0, resolvido: 0 };
  for (const r of rows) resultado[r.status] = r.n;
  return resultado;
}

export async function buscarChamado(id: string): Promise<ChamadoRow | null> {
  if (!/^\d+$/.test(id)) return null;
  const { rows } = await pool.query<ChamadoRow>(
    "select * from suporte_chamados where id = $1",
    [id]
  );
  return rows[0] ?? null;
}

export async function listarMensagens(chamadoId: string): Promise<MensagemRow[]> {
  const { rows } = await pool.query<MensagemRow>(
    "select * from suporte_mensagens where chamado_id = $1 order by criado_em, id",
    [chamadoId]
  );
  return rows;
}

export async function adicionarMensagem(
  chamadoId: string,
  autor: "casal" | "admin",
  texto: string
): Promise<void> {
  await pool.query(
    "insert into suporte_mensagens (chamado_id, autor, texto) values ($1, $2, $3)",
    [chamadoId, autor, texto]
  );
  // Casal respondeu num chamado resolvido: reabre. Admin respondeu num aberto: em andamento.
  await pool.query(
    `update suporte_chamados set atualizado_em = now(),
       status = case
         when $2 = 'casal' and status = 'resolvido' then 'aberto'
         when $2 = 'admin' and status = 'aberto' then 'em_andamento'
         else status end
     where id = $1`,
    [chamadoId, autor]
  );
}

export async function atualizarStatusChamado(
  chamadoId: string,
  status: StatusChamado
): Promise<void> {
  await pool.query(
    "update suporte_chamados set status = $2, atualizado_em = now() where id = $1",
    [chamadoId, status]
  );
}
