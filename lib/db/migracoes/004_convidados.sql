create table convidados (
  id                     bigserial primary key,
  casamento_id           bigint not null references casamentos(id) on delete cascade,
  nome                   text not null,
  lado                   text,
  limite_acompanhantes   integer not null default 0,

  codigo                 text not null unique,

  confirmado             boolean,
  numero_acompanhantes   integer not null default 0,
  nomes_acompanhantes    text,
  mensagem               text,
  respondido_em          timestamptz,

  criado_em              timestamptz not null default now(),
  atualizado_em          timestamptz not null default now()
);
create index convidados_casamento_id_idx on convidados (casamento_id);
