import { pool } from "../pool";

export type CustoRow = {
  id: string;
  casamento_id: string;
  categoria: string;
  fornecedor: string | null;
  observacoes: string | null;
  valor_centavos: number | null;
  valor_pago_centavos: number;
  ordem: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
};

export async function criarCusto(dados: {
  casamentoId: string;
  categoria: string;
  fornecedor: string | null;
  observacoes: string | null;
  valorCentavos: number | null;
}): Promise<CustoRow> {
  const { rows } = await pool.query<CustoRow>(
    `insert into custos (casamento_id, categoria, fornecedor, observacoes, valor_centavos)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [
      dados.casamentoId,
      dados.categoria,
      dados.fornecedor,
      dados.observacoes,
      dados.valorCentavos,
    ]
  );
  return rows[0];
}

export async function listarCustosPainel(
  casamentoId: string
): Promise<CustoRow[]> {
  const { rows } = await pool.query<CustoRow>(
    `select * from custos
     where casamento_id = $1 and ativo = true
     order by ordem asc, criado_em asc`,
    [casamentoId]
  );
  return rows;
}

export async function atualizarValorPago(
  id: string,
  casamentoId: string,
  valorPagoCentavos: number
): Promise<void> {
  await pool.query(
    `update custos set valor_pago_centavos = $3, atualizado_em = now()
     where id = $1 and casamento_id = $2`,
    [id, casamentoId, valorPagoCentavos]
  );
}

export async function arquivarCusto(
  id: string,
  casamentoId: string
): Promise<void> {
  await pool.query(
    "update custos set ativo = false, atualizado_em = now() where id = $1 and casamento_id = $2",
    [id, casamentoId]
  );
}
