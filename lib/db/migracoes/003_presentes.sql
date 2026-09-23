create table presentes (
  id             bigserial primary key,
  casamento_id   bigint not null references casamentos(id) on delete cascade,
  nome           text not null,
  descricao      text,
  preco_centavos integer,
  imagem_url     text,
  ordem          integer not null default 0,
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
create index presentes_casamento_id_idx on presentes (casamento_id);

create table presente_reservas (
  id               bigserial primary key,
  presente_id      bigint not null references presentes(id) on delete cascade,
  nome_convidado   text not null,
  email_convidado  text,
  mensagem         text,
  criado_em        timestamptz not null default now(),
  cancelado_em     timestamptz
);
create index presente_reservas_presente_id_idx on presente_reservas (presente_id);

-- no máximo 1 reserva ativa por presente — impede double-booking a nível de banco
create unique index presente_reservas_ativa_unica_idx
  on presente_reservas (presente_id)
  where cancelado_em is null;
