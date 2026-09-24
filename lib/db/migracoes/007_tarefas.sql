create table tarefas (
  id             bigserial primary key,
  casamento_id   bigint not null references casamentos(id) on delete cascade,
  titulo         text not null,
  descricao      text,
  prazo          date,
  concluida      boolean not null default false,
  ordem          integer not null default 0,
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
create index tarefas_casamento_id_idx on tarefas (casamento_id);
