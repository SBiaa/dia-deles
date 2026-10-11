create table cronograma_itens (
  id            bigserial primary key,
  casamento_id  bigint not null references casamentos(id) on delete cascade,
  horario       time not null,
  titulo        text not null,
  descricao     text,
  local         text,
  responsavel   text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index cronograma_itens_casamento_idx
  on cronograma_itens (casamento_id, horario);

-- Link público (somente leitura) para cerimonialista e família.
alter table casamentos add column cronograma_token text unique;
