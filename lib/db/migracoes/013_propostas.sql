-- Propostas de fornecedores, comparadas lado a lado por categoria.
create table propostas (
  id               bigserial primary key,
  casamento_id     bigint not null references casamentos(id) on delete cascade,
  categoria_chave  text not null,
  categoria        text not null,
  fornecedor       text not null,
  valor_centavos   integer not null check (valor_centavos >= 0),
  condicoes        text,
  inclui           text,
  contato          text,
  validade         date,
  observacoes      text,
  escolhida        boolean not null default false,
  custo_id         bigint references custos(id) on delete set null,
  ativo            boolean not null default true,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);
create index propostas_casamento_idx on propostas (casamento_id, categoria_chave);
