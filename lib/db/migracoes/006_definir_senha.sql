alter table usuarios alter column senha_hash drop not null;
alter table usuarios add column token_definir_senha text unique;
alter table usuarios add column token_definir_senha_expira_em timestamptz;
