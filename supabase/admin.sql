-- The couple's admin page (/admin) reads replies through this function.
-- Guests still can't read the rsvps table. The function only returns rows
-- when it gets a username and password that match the hash stored below.
-- The password itself is never stored, and it is not in the site's code.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.admin_login (
  username text primary key,
  pass_hash text not null
);
revoke all on private.admin_login from public, anon, authenticated;

create or replace function public.admin_replies(p_username text, p_password text)
returns setof public.rsvps
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.admin_login
    where username = lower(trim(p_username))
      and pass_hash = extensions.crypt(p_password, pass_hash)
  ) then
    -- Slow down anyone guessing.
    perform pg_sleep(1);
    raise exception 'Wrong username or password' using errcode = '28P01';
  end if;

  return query select * from public.rsvps order by created_at desc;
end;
$$;

revoke all on function public.admin_replies(text, text) from public;
grant execute on function public.admin_replies(text, text) to anon, authenticated;

-- To set or change the login, run this in the SQL editor with your own values:
--
--   insert into private.admin_login (username, pass_hash)
--   values ('ritvik-vineesha', extensions.crypt('NEW PASSWORD', extensions.gen_salt('bf', 10)))
--   on conflict (username) do update set pass_hash = excluded.pass_hash;
