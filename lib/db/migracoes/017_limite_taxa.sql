-- Contadores de rate limit (janela fixa). Linhas antigas são limpas aos poucos
-- pelo próprio código (lib/limite.ts).
create table limite_taxa (
  chave   text        not null,
  janela  timestamptz not null,
  total   integer     not null default 1,
  primary key (chave, janela)
);
create index limite_taxa_janela_idx on limite_taxa (janela);
