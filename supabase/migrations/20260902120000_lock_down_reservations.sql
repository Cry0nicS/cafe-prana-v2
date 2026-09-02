-- Lock the reservations table down to the service role.
--
-- The table was created with row-level security disabled, and Supabase grants
-- the anon and authenticated roles full privileges on every table in `public`
-- by default. Together that let anyone holding the anon key, which is public by
-- design and was shipped in the v1 site's HTML, read, insert, update and delete
-- every reservation.
--
-- The server talks to the table with the service-role key only, which bypasses
-- row-level security and keeps its privileges. Nothing else needs access.
--
-- Run in the Supabase SQL editor; there is no CLI-managed migration history
-- for this project, the file exists so the change is versioned with the code.

alter table public.reservations enable row level security;

revoke all on table public.reservations from anon, authenticated;
revoke all on sequence public.reservations_id_seq from anon, authenticated;
