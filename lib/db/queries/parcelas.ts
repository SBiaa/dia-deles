import { pool } from "../pool";

export type ParcelaRow = {
  id: string;
  custo_id: string;
  casamento_id: string;
  numero: number;
  valor_centavos: number;
  vencimento: string | null;
  paga: boolean;
  paga_em: string | null;
};

const CAMPOS =
  "id, custo_id, casamento_id, numero, valor_centavos, vencimento, paga, paga_em";

export async function listarParcelas(
  casamentoId: string
): Promise<ParcelaRow[]> {
  const { rows } = await pool.query<ParcelaRow>(
    `select ${CAMPOS} from parcelas
     where casamento_id = $1
       and custo_id in (
         select id from custos where casamento_id = $1 and ativo = true
       )
     order by vencimento asc nulls last, numero asc`,
    [casamentoId]
  );
  return rows;
}

/** O valor pago de um custo parcelado é a soma das parcelas pagas. */
const RECALCULAR_PAGO = `
  update custos c set
    valor_pago_centavos = coalesce(
      (select sum(p.valor_centavos) from parcelas p
       where p.custo_id = c.id and p.paga), 0),
    atualizado_em = now()
  where c.id = $1 and c.casamento_id = $2
`;

/** Troca todas as parcelas do custo por um novo parcelamento (nenhuma paga). */
export async function substituirParcelas(
  custoId: string,
  casamentoId: string,
  parcelas: { valorCentavos: number; vencimento: string }[]
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      "select 1 from custos where id = $1 and casamento_id = $2",
      [custoId, casamentoId]
    );
    if (rows.length === 0) {
      await client.query("rollback");
      return;
    }
    await client.query("delete from parcelas where custo_id = $1", [custoId]);
    for (const [i, p] of parcelas.entries()) {
      await client.query(
        `insert into parcelas
           (custo_id, casamento_id, numero, valor_centavos, vencimento)
         values ($1, $2, $3, $4, $5)`,
        [custoId, casamentoId, i + 1, p.valorCentavos, p.vencimento]
      );
    }
    await client.query(RECALCULAR_PAGO, [custoId, casamentoId]);
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

/** Remove o parcelamento; o valor pago volta a ser informado manualmente. */
export async function removerParcelas(
  custoId: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "delete from parcelas where custo_id = $1 and casamento_id = $2",
    [custoId, casamentoId]
  );
}

export async function alternarParcelaPaga(
  parcelaId: string,
  casamentoId: string
): Promise<void> {
  const { rows } = await pool.query<{ custo_id: string }>(
    `update parcelas set
       paga = not paga,
       paga_em = case when paga then null else current_date end
     where id = $1 and casamento_id = $2
     returning custo_id`,
    [parcelaId, casamentoId]
  );
  if (rows[0]) {
    await pool.query(RECALCULAR_PAGO, [rows[0].custo_id, casamentoId]);
  }
}
