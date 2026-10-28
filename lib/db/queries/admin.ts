import { pool } from "../pool";

const FUSO = "America/Sao_Paulo";

const ATIVADO_SQL = `(
  c.publicado
  or exists (select 1 from convidados t where t.casamento_id = c.id)
  or exists (select 1 from presentes t where t.casamento_id = c.id)
  or exists (select 1 from custos t where t.casamento_id = c.id)
  or exists (select 1 from cronograma_itens t where t.casamento_id = c.id)
  or exists (select 1 from padrinhos t where t.casamento_id = c.id)
  or exists (select 1 from mesas t where t.casamento_id = c.id)
)`;

export type Totais = {
  casais: number;
  com_senha: number;
  sem_senha: number;
  publicados: number;
  ativados: number;
  novos_7d: number;
  novos_30d: number;
  ativos_7d: number;
  ativos_30d: number;
  nunca_voltaram: number;
  rsvps: number;
  convidados: number;
};

export async function buscarTotais(): Promise<Totais> {
  const { rows } = await pool.query<Totais>(`
    select
      count(*)::int as casais,
      count(*) filter (where u.senha_hash is not null)::int as com_senha,
      count(*) filter (where u.senha_hash is null)::int as sem_senha,
      count(*) filter (where c.publicado)::int as publicados,
      count(*) filter (where ${ATIVADO_SQL})::int as ativados,
      count(*) filter (where u.criado_em > now() - interval '7 days')::int as novos_7d,
      count(*) filter (where u.criado_em > now() - interval '30 days')::int as novos_30d,
      count(*) filter (where u.ultimo_acesso_em > now() - interval '7 days')::int as ativos_7d,
      count(*) filter (where u.ultimo_acesso_em > now() - interval '30 days')::int as ativos_30d,
      count(*) filter (where u.ultimo_acesso_em is null
                         and u.criado_em < now() - interval '3 days')::int as nunca_voltaram,
      (select count(*)::int from rsvps) as rsvps,
      (select count(*)::int from convidados) as convidados
    from usuarios u
    join casamentos c on c.usuario_id = u.id
  `);
  return rows[0];
}

export type PontoSerie = { dia: string; valor: number };

function serieSql(origem: string): string {
  return `
    with dias as (
      select generate_series(
        (now() at time zone '${FUSO}')::date - ($1::int - 1),
        (now() at time zone '${FUSO}')::date,
        interval '1 day')::date as dia
    )
    select d.dia::text as dia, coalesce(x.valor, 0)::int as valor
    from dias d
    left join (${origem}) x on x.dia = d.dia
    order by d.dia`;
}

export async function serieCadastros(dias: number): Promise<PontoSerie[]> {
  const { rows } = await pool.query<PontoSerie>(
    serieSql(`select (criado_em at time zone '${FUSO}')::date as dia, count(*) as valor
              from usuarios group by 1`),
    [dias]
  );
  return rows;
}

export async function serieVisitantes(dias: number): Promise<PontoSerie[]> {
  const { rows } = await pool.query<PontoSerie>(
    serieSql(`select (criado_em at time zone '${FUSO}')::date as dia,
                     count(distinct visitante_id) as valor
              from visitas where usuario_id is null group by 1`),
    [dias]
  );
  return rows;
}

export async function serieAtivos(dias: number): Promise<PontoSerie[]> {
  const { rows } = await pool.query<PontoSerie>(
    serieSql(`select (criado_em at time zone '${FUSO}')::date as dia,
                     count(distinct usuario_id) as valor
              from visitas where usuario_id is not null group by 1`),
    [dias]
  );
  return rows;
}

export type Funil = {
  visitantes: number;
  viram_cadastro: number;
  cadastros: number;
  definiram_senha: number;
  ativaram: number;
  voltaram: number;
  so_olharam: number;
};

export async function buscarFunil(dias: number): Promise<Funil> {
  const [visitas, cadastros] = await Promise.all([
    pool.query<{
      visitantes: number;
      viram_cadastro: number;
      so_olharam: number;
    }>(
      `with v as (
         select visitante_id, count(*) as n,
                bool_or(caminho = '/cadastro') as viu_cadastro
         from visitas
         where criado_em > now() - make_interval(days => $1)
           and usuario_id is null
         group by visitante_id
       )
       select count(*)::int as visitantes,
              count(*) filter (where viu_cadastro)::int as viram_cadastro,
              count(*) filter (
                where n = 1
                  and not exists (select 1 from usuarios u where u.visitante_id = v.visitante_id)
              )::int as so_olharam
       from v`,
      [dias]
    ),
    pool.query<{
      cadastros: number;
      definiram_senha: number;
      ativaram: number;
      voltaram: number;
    }>(
      `select count(*)::int as cadastros,
              count(*) filter (where u.senha_hash is not null)::int as definiram_senha,
              count(*) filter (where ${ATIVADO_SQL})::int as ativaram,
              count(*) filter (where u.ultimo_acesso_em > u.criado_em + interval '1 day')::int as voltaram
       from usuarios u
       join casamentos c on c.usuario_id = u.id
       where u.criado_em > now() - make_interval(days => $1)`,
      [dias]
    ),
  ]);
  return { ...visitas.rows[0], ...cadastros.rows[0] };
}

export type LinhaOrigem = {
  origem: string;
  visitantes: number;
  cadastros: number;
};

export async function listarOrigens(dias: number): Promise<LinhaOrigem[]> {
  const { rows } = await pool.query<LinhaOrigem>(
    `with v as (
       select visitante_id, coalesce(min(origem), 'direto') as origem
       from visitas
       where criado_em > now() - make_interval(days => $1) and usuario_id is null
       group by visitante_id
     )
     select v.origem,
            count(*)::int as visitantes,
            count(*) filter (
              where exists (select 1 from usuarios u where u.visitante_id = v.visitante_id)
            )::int as cadastros
     from v group by v.origem order by visitantes desc limit 8`,
    [dias]
  );
  return rows;
}

export type UsoRecurso = { recurso: string; casais: number };

export async function listarUsoRecursos(): Promise<UsoRecurso[]> {
  const { rows } = await pool.query<UsoRecurso>(`
    select recurso, casais::int from (
      select 'Convidados' as recurso, count(distinct casamento_id) as casais from convidados
      union all select 'Presentes', count(distinct casamento_id) from presentes
      union all select 'Custos', count(distinct casamento_id) from custos
      union all select 'Checklist', count(distinct casamento_id) from tarefas
      union all select 'Mesas', count(distinct casamento_id) from mesas
      union all select 'Cronograma', count(distinct casamento_id) from cronograma_itens
      union all select 'Orçamentos', count(distinct casamento_id) from propostas
      union all select 'Padrinhos', count(distinct casamento_id) from padrinhos
      union all select 'Galeria (fotos)', count(distinct casamento_id) from fotos
      union all select 'RSVPs recebidos', count(distinct casamento_id) from rsvps
    ) t order by casais desc
  `);
  return rows;
}

export type FiltroCasais = "todos" | "ativos" | "inativos" | "sem_senha";

export type LinhaCasal = {
  usuario_id: string;
  casamento_id: string;
  email: string;
  nome: string;
  slug: string;
  nome_parceiro_1: string;
  nome_parceiro_2: string;
  data_casamento: string | null;
  publicado: boolean;
  tem_senha: boolean;
  criado_em: string;
  ultimo_acesso_em: string | null;
  origem: string | null;
  convidados: number;
  chamados_abertos: number;
};

export const POR_PAGINA = 30;

export async function listarCasais(opcoes: {
  busca: string;
  filtro: FiltroCasais;
  pagina: number;
}): Promise<{ linhas: LinhaCasal[]; total: number }> {
  const busca = `%${opcoes.busca.trim().toLowerCase()}%`;
  const where = `
    where ($1 = '%%' or lower(u.email) like $1 or lower(u.nome) like $1
           or c.slug like $1 or lower(c.nome_parceiro_1) like $1
           or lower(c.nome_parceiro_2) like $1)
      and (
        $2 = 'todos'
        or ($2 = 'ativos' and u.ultimo_acesso_em > now() - interval '7 days')
        or ($2 = 'inativos' and u.senha_hash is not null
            and (u.ultimo_acesso_em is null or u.ultimo_acesso_em <= now() - interval '7 days'))
        or ($2 = 'sem_senha' and u.senha_hash is null)
      )`;
  const [lista, contagem] = await Promise.all([
    pool.query<LinhaCasal>(
      `select u.id as usuario_id, c.id as casamento_id, u.email, u.nome, c.slug,
              c.nome_parceiro_1, c.nome_parceiro_2, c.data_casamento, c.publicado,
              (u.senha_hash is not null) as tem_senha,
              u.criado_em, u.ultimo_acesso_em, u.origem,
              (select count(*)::int from convidados t where t.casamento_id = c.id) as convidados,
              (select count(*)::int from suporte_chamados s
                 where s.usuario_id = u.id and s.status <> 'resolvido') as chamados_abertos
       from usuarios u join casamentos c on c.usuario_id = u.id
       ${where}
       order by u.criado_em desc
       limit ${POR_PAGINA} offset $3`,
      [busca, opcoes.filtro, (opcoes.pagina - 1) * POR_PAGINA]
    ),
    pool.query<{ n: number }>(
      `select count(*)::int as n
       from usuarios u join casamentos c on c.usuario_id = u.id ${where}`,
      [busca, opcoes.filtro]
    ),
  ]);
  return { linhas: lista.rows, total: contagem.rows[0].n };
}

export type DetalheCasal = LinhaCasal & {
  token_definir_senha: string | null;
  token_definir_senha_expira_em: string | null;
  presentes: number;
  custos: number;
  tarefas: number;
  rsvps: number;
  fotos: number;
  acessos_30d: number;
};

export async function buscarDetalheCasal(
  usuarioId: string
): Promise<DetalheCasal | null> {
  if (!/^\d+$/.test(usuarioId)) return null;
  const { rows } = await pool.query<DetalheCasal>(
    `select u.id as usuario_id, c.id as casamento_id, u.email, u.nome, c.slug,
            c.nome_parceiro_1, c.nome_parceiro_2, c.data_casamento, c.publicado,
            (u.senha_hash is not null) as tem_senha,
            u.criado_em, u.ultimo_acesso_em, u.origem,
            u.token_definir_senha, u.token_definir_senha_expira_em,
            (select count(*)::int from convidados t where t.casamento_id = c.id) as convidados,
            (select count(*)::int from presentes t where t.casamento_id = c.id) as presentes,
            (select count(*)::int from custos t where t.casamento_id = c.id) as custos,
            (select count(*)::int from tarefas t where t.casamento_id = c.id) as tarefas,
            (select count(*)::int from rsvps t where t.casamento_id = c.id) as rsvps,
            (select count(*)::int from fotos t where t.casamento_id = c.id) as fotos,
            (select count(distinct (v.criado_em at time zone '${FUSO}')::date)::int
               from visitas v where v.usuario_id = u.id
                and v.criado_em > now() - interval '30 days') as acessos_30d,
            (select count(*)::int from suporte_chamados s
               where s.usuario_id = u.id and s.status <> 'resolvido') as chamados_abertos
     from usuarios u join casamentos c on c.usuario_id = u.id
     where u.id = $1`,
    [usuarioId]
  );
  return rows[0] ?? null;
}

export async function gerarTokenRedefinicao(
  usuarioId: string,
  token: string
): Promise<void> {
  await pool.query(
    `update usuarios set token_definir_senha = $2,
       token_definir_senha_expira_em = now() + interval '2 days',
       atualizado_em = now()
     where id = $1`,
    [usuarioId, token]
  );
}

export async function trocarEmailUsuario(
  usuarioId: string,
  email: string
): Promise<boolean> {
  const { rowCount } = await pool.query(
    `update usuarios set email = $2, atualizado_em = now()
     where id = $1 and not exists (select 1 from usuarios where email = $2 and id <> $1)`,
    [usuarioId, email.toLowerCase().trim()]
  );
  return (rowCount ?? 0) > 0;
}
