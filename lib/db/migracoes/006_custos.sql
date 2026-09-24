create table custos (
  id                  bigserial primary key,
  casamento_id        bigint not null references casamentos(id) on delete cascade,
  categoria           text not null,
  fornecedor          text,
  observacoes         text,
  valor_centavos      integer,
  valor_pago_centavos integer not null default 0,
  ordem               integer not null default 0,
  ativo               boolean not null default true,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);
create index custos_casamento_id_idx on custos (casamento_id);
