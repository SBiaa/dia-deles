-- Orçamento previsto por categoria (a chave normaliza maiúsculas e acentos).
create table orcamentos_categoria (
  id               bigserial primary key,
  casamento_id     bigint not null references casamentos(id) on delete cascade,
  categoria_chave  text not null,
  categoria        text not null,
  valor_centavos   integer not null check (valor_centavos >= 0),
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  unique (casamento_id, categoria_chave)
);
create index orcamentos_categoria_casamento_idx
  on orcamentos_categoria (casamento_id);

-- Parcelas de um custo, com vencimento e situação de pagamento.
create table parcelas (
  id              bigserial primary key,
  custo_id        bigint not null references custos(id) on delete cascade,
  casamento_id    bigint not null references casamentos(id) on delete cascade,
  numero          integer not null,
  valor_centavos  integer not null check (valor_centavos >= 0),
  vencimento      date,
  paga            boolean not null default false,
  paga_em         date,
  criado_em       timestamptz not null default now(),
  unique (custo_id, numero)
);
create index parcelas_custo_idx on parcelas (custo_id);
create index parcelas_vencimento_idx on parcelas (casamento_id, vencimento);
