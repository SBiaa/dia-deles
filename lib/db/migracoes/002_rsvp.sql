create table rsvps (
  id                    bigserial primary key,
  casamento_id          bigint not null references casamentos(id) on delete cascade,
  nome_convidado        text not null,
  email                 text,
  telefone              text,
  confirmado            boolean not null,
  numero_acompanhantes  integer not null default 0,
  nomes_acompanhantes   text,
  mensagem              text,
  ip_origem             inet,
  criado_em             timestamptz not null default now()
);
create index rsvps_casamento_id_idx on rsvps (casamento_id);
