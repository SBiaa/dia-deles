import { pool } from "../pool";
import { chaveCategoria } from "@/lib/financeiro";

export type OrcamentoRow = {
  id: string;
  casamento_id: string;
  categoria_chave: string;
  categoria: string;
  valor_centavos: number;
};

export async function listarOrcamentos(
  casamentoId: string
): Promise<OrcamentoRow[]> {
  const { rows } = await pool.query<OrcamentoRow>(
    `select id, casamento_id, categoria_chave, categoria, valor_centavos
     from orcamentos_categoria
     where casamento_id = $1
     order by categoria asc`,
    [casamentoId]
  );
  return rows;
}

/** Cria ou atualiza o orçamento da categoria; valor nulo remove. */
export async function definirOrcamento(
  casamentoId: string,
  categoria: string,
  valorCentavos: number | null
): Promise<void> {
  const chave = chaveCategoria(categoria);
  if (valorCentavos === null) {
    await pool.query(
      "delete from orcamentos_categoria where casamento_id = $1 and categoria_chave = $2",
      [casamentoId, chave]
    );
    return;
  }
  await pool.query(
    `insert into orcamentos_categoria
       (casamento_id, categoria_chave, categoria, valor_centavos)
     values ($1, $2, $3, $4)
     on conflict (casamento_id, categoria_chave)
     do update set valor_centavos = excluded.valor_centavos,
                   categoria = excluded.categoria,
                   atualizado_em = now()`,
    [casamentoId, chave, categoria.trim(), valorCentavos]
  );
}
