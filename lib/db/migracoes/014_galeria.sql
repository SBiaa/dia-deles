-- Galeria colaborativa: convidados enviam fotos por um link/QR compartilhado.
alter table casamentos add column galeria_token text unique;
alter table casamentos add column galeria_moderada boolean not null default true;

create table fotos (
  id            bigserial primary key,
  casamento_id  bigint not null references casamentos(id) on delete cascade,
  url           text not null,
  nome_autor    text not null,
  status        text not null default 'pendente'
                check (status in ('pendente', 'aprovada')),
  criado_em     timestamptz not null default now()
);
create index fotos_casamento_status_idx
  on fotos (casamento_id, status, criado_em desc);
