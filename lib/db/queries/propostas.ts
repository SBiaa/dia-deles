import { pool } from "../pool";
import { chaveCategoria } from "@/lib/financeiro";

export type PropostaRow = {
  id: string;
  casamento_id: string;
  categoria_chave: string;
  categoria: string;
  fornecedor: string;
  valor_centavos: number;
  condicoes: string | null;
  inclui: string | null;
  contato: string | null;
  validade: string | null;
  observacoes: string | null;
  escolhida: boolean;
  custo_id: string | null;
};

const CAMPOS = `id, casamento_id, categoria_chave, categoria, fornecedor,
  valor_centavos, condicoes, inclui, contato, validade, observacoes,
  escolhida, custo_id`;

export async function listarPropostas(
  casamentoId: string
): Promise<PropostaRow[]> {
  const { rows } = await pool.query<PropostaRow>(
    `select ${CAMPOS} from propostas
     where casamento_id = $1 and ativo = true
     order by categoria_chave asc, valor_centavos asc, id asc`,
    [casamentoId]
  );
  return rows;
}

export async function criarProposta(dados: {
  casamentoId: string;
  categoria: string;
  fornecedor: string;
  valorCentavos: number;
  condicoes: string | null;
  inclui: string | null;
  contato: string | null;
  validade: string | null;
  observacoes: string | null;
}): Promise<void> {
  await pool.query(
    `insert into propostas
       (casamento_id, categoria_chave, categoria, fornecedor, valor_centavos,
        condicoes, inclui, contato, validade, observacoes)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      dados.casamentoId,
      chaveCategoria(dados.categoria),
      dados.categoria.trim(),
      dados.fornecedor,
      dados.valorCentavos,
      dados.condicoes,
      dados.inclui,
      dados.contato,
      dados.validade,
      dados.observacoes,
    ]
  );
}

/** Libera o custo de uma proposta; só arquiva se nada foi pago ainda. */
const ARQUIVAR_CUSTO_SEM_PAGAMENTO = `
  update custos set ativo = false, atualizado_em = now()
  where id = $1 and casamento_id = $2 and valor_pago_centavos = 0
`;

export async function removerProposta(
  id: string,
  casamentoId: string
): Promise<void> {
  const { rows } = await pool.query<{ custo_id: string | null; escolhida: boolean }>(
    "select custo_id, escolhida from propostas where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
  const proposta = rows[0];
  if (!proposta) return;
  if (proposta.escolhida && proposta.custo_id) {
    await pool.query(ARQUIVAR_CUSTO_SEM_PAGAMENTO, [proposta.custo_id, casamentoId]);
  }
  await pool.query(
    "update propostas set ativo = false, escolhida = false, custo_id = null, atualizado_em = now() where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}

/**
 * Escolhe a proposta: desmarca a anterior da mesma categoria e cria o custo
 * correspondente no Financeiro.
 */
export async function escolherProposta(
  id: string,
  casamentoId: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<PropostaRow>(
      `select ${CAMPOS} from propostas
       where id = $1 and casamento_id = $2 and ativo = true for update`,
      [id, casamentoId]
    );
    const proposta = rows[0];
    if (!proposta || proposta.escolhida) {
      await client.query("rollback");
      return;
    }

    const anteriores = await client.query<{ id: string; custo_id: string | null }>(
      `select id, custo_id from propostas
       where casamento_id = $1 and categoria_chave = $2
         and escolhida = true and id <> $3`,
      [casamentoId, proposta.categoria_chave, id]
    );
    for (const anterior of anteriores.rows) {
      if (anterior.custo_id) {
        await client.query(ARQUIVAR_CUSTO_SEM_PAGAMENTO, [
          anterior.custo_id,
          casamentoId,
        ]);
      }
      await client.query(
        "update propostas set escolhida = false, custo_id = null, atualizado_em = now() where id = $1",
        [anterior.id]
      );
    }

    const novoCusto = await client.query<{ id: string }>(
      `insert into custos
         (casamento_id, categoria, fornecedor, observacoes, valor_centavos)
       values ($1, $2, $3, $4, $5)
       returning id`,
      [
        casamentoId,
        proposta.categoria,
        proposta.fornecedor,
        proposta.condicoes,
        proposta.valor_centavos,
      ]
    );
    await client.query(
      "update propostas set escolhida = true, custo_id = $2, atualizado_em = now() where id = $1",
      [id, novoCusto.rows[0].id]
    );
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export async function desfazerEscolha(
  id: string,
  casamentoId: string
): Promise<void> {
  const { rows } = await pool.query<{ custo_id: string | null }>(
    "select custo_id from propostas where id = $1 and casamento_id = $2 and escolhida = true",
    [id, casamentoId]
  );
  if (!rows[0]) return;
  if (rows[0].custo_id) {
    await pool.query(ARQUIVAR_CUSTO_SEM_PAGAMENTO, [rows[0].custo_id, casamentoId]);
  }
  await pool.query(
    "update propostas set escolhida = false, custo_id = null, atualizado_em = now() where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}
