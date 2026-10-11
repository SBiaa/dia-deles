-- Check-in na entrada: quando o convidado chegou e quantas pessoas vieram.
alter table convidados add column checkin_em timestamptz;
alter table convidados add column checkin_pessoas integer;
create index convidados_checkin_idx on convidados (casamento_id, checkin_em);
