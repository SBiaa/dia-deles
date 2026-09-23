import { pool } from "../pool";

export type CasamentoRow = {
  id: string;
  usuario_id: string;
  slug: string;
  nome_parceiro_1: string;
  nome_parceiro_2: string;
  data_casamento: string | null;
  fuso_horario: string;
  historia_titulo: string | null;
  historia_texto: string | null;
  cerimonia_local_nome: string | null;
  cerimonia_endereco: string | null;
  cerimonia_data_hora: string | null;
  cerimonia_mapa_url: string | null;
  recepcao_local_nome: string | null;
  recepcao_endereco: string | null;
  recepcao_data_hora: string | null;
  recepcao_mapa_url: string | null;
  instagram_url: string | null;
  foto_capa_url: string | null;
  publicado: boolean;
  criado_em: string;
  atualizado_em: string;
};

export async function criarCasamento(dados: {
  usuarioId: string;
  slug: string;
  nomeParceiro1: string;
  nomeParceiro2: string;
  dataCasamento: string | null;
}): Promise<CasamentoRow> {
  const { rows } = await pool.query<CasamentoRow>(
    `insert into casamentos (usuario_id, slug, nome_parceiro_1, nome_parceiro_2, data_casamento)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [
      dados.usuarioId,
      dados.slug,
      dados.nomeParceiro1.trim(),
      dados.nomeParceiro2.trim(),
      dados.dataCasamento,
    ]
  );
  return rows[0];
}

export async function buscarCasamentoPorId(
  id: string
): Promise<CasamentoRow | null> {
  const { rows } = await pool.query<CasamentoRow>(
    "select * from casamentos where id = $1",
    [id]
  );
  return rows[0] ?? null;
}

export async function buscarCasamentoPorUsuarioId(
  usuarioId: string
): Promise<CasamentoRow | null> {
  const { rows } = await pool.query<CasamentoRow>(
    "select * from casamentos where usuario_id = $1",
    [usuarioId]
  );
  return rows[0] ?? null;
}

export async function buscarCasamentoPorSlug(
  slug: string
): Promise<CasamentoRow | null> {
  const { rows } = await pool.query<CasamentoRow>(
    "select * from casamentos where slug = $1",
    [slug]
  );
  return rows[0] ?? null;
}

export async function existeSlug(slug: string): Promise<boolean> {
  const { rows } = await pool.query(
    "select 1 from casamentos where slug = $1",
    [slug]
  );
  return rows.length > 0;
}

export async function existeSlugParaOutroCasamento(
  slug: string,
  casamentoId: string
): Promise<boolean> {
  const { rows } = await pool.query(
    "select 1 from casamentos where slug = $1 and id <> $2",
    [slug, casamentoId]
  );
  return rows.length > 0;
}

export type AtualizacaoSite = Partial<{
  nomeParceiro1: string;
  nomeParceiro2: string;
  dataCasamento: string | null;
  fusoHorario: string;
  historiaTitulo: string | null;
  historiaTexto: string | null;
  cerimoniaLocalNome: string | null;
  cerimoniaEndereco: string | null;
  cerimoniaDataHora: string | null;
  cerimoniaMapaUrl: string | null;
  recepcaoLocalNome: string | null;
  recepcaoEndereco: string | null;
  recepcaoDataHora: string | null;
  recepcaoMapaUrl: string | null;
  instagramUrl: string | null;
  fotoCapaUrl: string | null;
}>;

const MAPA_COLUNAS: Record<keyof AtualizacaoSite, string> = {
  nomeParceiro1: "nome_parceiro_1",
  nomeParceiro2: "nome_parceiro_2",
  dataCasamento: "data_casamento",
  fusoHorario: "fuso_horario",
  historiaTitulo: "historia_titulo",
  historiaTexto: "historia_texto",
  cerimoniaLocalNome: "cerimonia_local_nome",
  cerimoniaEndereco: "cerimonia_endereco",
  cerimoniaDataHora: "cerimonia_data_hora",
  cerimoniaMapaUrl: "cerimonia_mapa_url",
  recepcaoLocalNome: "recepcao_local_nome",
  recepcaoEndereco: "recepcao_endereco",
  recepcaoDataHora: "recepcao_data_hora",
  recepcaoMapaUrl: "recepcao_mapa_url",
  instagramUrl: "instagram_url",
  fotoCapaUrl: "foto_capa_url",
};

export async function atualizarSite(
  casamentoId: string,
  dados: AtualizacaoSite
): Promise<CasamentoRow> {
  const entradas = Object.entries(dados).filter(([, v]) => v !== undefined) as [
    keyof AtualizacaoSite,
    string | null,
  ][];

  if (entradas.length === 0) {
    const { rows } = await pool.query<CasamentoRow>(
      "select * from casamentos where id = $1",
      [casamentoId]
    );
    return rows[0];
  }

  const sets = entradas.map(
    ([campo], i) => `${MAPA_COLUNAS[campo]} = $${i + 2}`
  );
  const valores = entradas.map(([, valor]) => valor);

  const { rows } = await pool.query<CasamentoRow>(
    `update casamentos set ${sets.join(", ")}, atualizado_em = now()
     where id = $1
     returning *`,
    [casamentoId, ...valores]
  );
  return rows[0];
}

export async function definirPublicado(
  casamentoId: string,
  publicado: boolean
): Promise<void> {
  await pool.query(
    "update casamentos set publicado = $2, atualizado_em = now() where id = $1",
    [casamentoId, publicado]
  );
}

export async function atualizarSlug(
  casamentoId: string,
  slug: string
): Promise<void> {
  await pool.query(
    "update casamentos set slug = $2, atualizado_em = now() where id = $1",
    [casamentoId, slug]
  );
}
