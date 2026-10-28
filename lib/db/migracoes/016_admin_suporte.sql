-- Acompanhamento de uso (admin) e suporte.
alter table usuarios add column ultimo_acesso_em timestamptz;
alter table usuarios add column visitante_id text;
alter table usuarios add column origem text;

create table visitas (
  id            bigserial primary key,
  visitante_id  text not null,
  usuario_id    bigint references usuarios(id) on delete set null,
  caminho       text not null,
  origem        text,
  criado_em     timestamptz not null default now()
);
create index visitas_criado_em_idx on visitas (criado_em);
create index visitas_visitante_idx on visitas (visitante_id);
create index visitas_usuario_idx on visitas (usuario_id, criado_em);

create table suporte_chamados (
  id             bigserial primary key,
  usuario_id     bigint references usuarios(id) on delete set null,
  nome           text not null,
  email          text not null,
  tipo           text not null default 'bug'
                 check (tipo in ('bug', 'duvida', 'sugestao', 'outro')),
  assunto        text not null,
  status         text not null default 'aberto'
                 check (status in ('aberto', 'em_andamento', 'resolvido')),
  navegador      text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
create index suporte_chamados_usuario_idx on suporte_chamados (usuario_id);
create index suporte_chamados_status_idx on suporte_chamados (status, atualizado_em);

create table suporte_mensagens (
  id          bigserial primary key,
  chamado_id  bigint not null references suporte_chamados(id) on delete cascade,
  autor       text not null check (autor in ('casal', 'admin')),
  texto       text not null,
  criado_em   timestamptz not null default now()
);
create index suporte_mensagens_chamado_idx on suporte_mensagens (chamado_id, criado_em);
