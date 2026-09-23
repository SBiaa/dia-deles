create table usuarios (
  id             bigserial primary key,
  email          text not null unique,
  senha_hash     text not null,
  nome           text not null,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create table casamentos (
  id                     bigserial primary key,
  usuario_id             bigint not null unique references usuarios(id) on delete cascade,
  slug                   text not null unique,
  nome_parceiro_1        text not null,
  nome_parceiro_2        text not null,
  data_casamento         date,
  fuso_horario           text not null default 'America/Sao_Paulo',

  historia_titulo        text,
  historia_texto         text,

  cerimonia_local_nome   text,
  cerimonia_endereco     text,
  cerimonia_data_hora    timestamptz,
  cerimonia_mapa_url     text,

  recepcao_local_nome    text,
  recepcao_endereco      text,
  recepcao_data_hora     timestamptz,
  recepcao_mapa_url      text,

  instagram_url          text,
  foto_capa_url          text,

  publicado              boolean not null default false,
  criado_em              timestamptz not null default now(),
  atualizado_em          timestamptz not null default now(),

  constraint slug_formato check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
create index casamentos_usuario_id_idx on casamentos (usuario_id);
