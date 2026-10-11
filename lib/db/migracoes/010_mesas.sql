create table mesas (
  id             bigserial primary key,
  casamento_id   bigint not null references casamentos(id) on delete cascade,
  nome           text not null,
  capacidade     integer not null default 8 check (capacidade between 1 and 40),
  ordem          integer not null default 0,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
create index mesas_casamento_idx on mesas (casamento_id);

-- Ao remover a mesa, os convidados voltam para "sem mesa".
alter table convidados
  add column mesa_id bigint references mesas(id) on delete set null;
create index convidados_mesa_idx on convidados (mesa_id);
