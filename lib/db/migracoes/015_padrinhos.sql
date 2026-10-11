-- Área dos padrinhos: convite pessoal e manual com orientações.
alter table casamentos add column padrinhos_mensagem text;

create table padrinhos (
  id               bigserial primary key,
  casamento_id     bigint not null references casamentos(id) on delete cascade,
  nome             text not null,
  papel            text not null default 'Padrinho',
  telefone         text,
  horario_chegada  time,
  nota_pessoal     text,
  token            text not null unique,
  aceitou          boolean,
  respondido_em    timestamptz,
  resposta_mensagem text,
  ordem            integer not null default 0,
  criado_em        timestamptz not null default now()
);
create index padrinhos_casamento_idx on padrinhos (casamento_id, ordem);

create table padrinhos_manual (
  id            bigserial primary key,
  casamento_id  bigint not null references casamentos(id) on delete cascade,
  titulo        text not null,
  texto         text not null,
  ordem         integer not null default 0,
  criado_em     timestamptz not null default now()
);
create index padrinhos_manual_casamento_idx
  on padrinhos_manual (casamento_id, ordem);
