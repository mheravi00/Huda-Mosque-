-- Staff usernames (firstname.lastname, numbered on clash) and self-service
-- teacher account requests that stay inactive until an admin approves them.

alter table public.profiles
  add column if not exists username text,
  add column if not exists approval_status text not null default 'approved';

alter table public.profiles drop constraint if exists profiles_approval_status_check;
alter table public.profiles
  add constraint profiles_approval_status_check
  check (approval_status in ('pending', 'approved'));

alter table public.teachers
  add column if not exists application_note text;

create or replace function public.generate_username(first_name text, last_name text, exclude_profile uuid default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  suffix int := 1;
begin
  base := concat_ws('.',
    nullif(regexp_replace(lower(coalesce(first_name, '')), '[^a-z0-9]', '', 'g'), ''),
    nullif(regexp_replace(lower(coalesce(last_name, '')), '[^a-z0-9]', '', 'g'), '')
  );
  if base is null or base = '' then
    base := 'staff';
  end if;
  candidate := base;
  while exists (
    select 1 from public.profiles
    where username = candidate and (exclude_profile is null or id <> exclude_profile)
  ) loop
    suffix := suffix + 1;
    candidate := base || suffix;
  end loop;
  return candidate;
end;
$$;

revoke all on function public.generate_username(text, text, uuid) from public, anon, authenticated;

create or replace function public.set_profile_username()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.username is null or trim(new.username) = '' then
    new.username := public.generate_username(new.first_name, new.last_name, new.id);
  else
    new.username := lower(trim(new.username));
  end if;
  return new;
end;
$$;

revoke all on function public.set_profile_username() from public, anon, authenticated;

drop trigger if exists profiles_set_username on public.profiles;
create trigger profiles_set_username
before insert or update of username on public.profiles
for each row execute function public.set_profile_username();

-- Backfill existing staff, oldest first so the original account keeps the
-- un-numbered username.
do $$
declare
  p record;
begin
  for p in select id, first_name, last_name from public.profiles where username is null order by created_at loop
    update public.profiles
    set username = public.generate_username(p.first_name, p.last_name, p.id)
    where id = p.id;
  end loop;
end;
$$;

alter table public.profiles alter column username set not null;
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format check (username ~ '^[a-z0-9]+(\.[a-z0-9]+)*$');
create unique index if not exists profiles_username_key on public.profiles(username);

-- Self-service sign-ups carry app_metadata.approval = 'pending' and start
-- inactive; admin-created accounts are approved immediately.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role text;
  is_pending boolean;
  created_profile_id uuid;
begin
  selected_role := case
    when lower(new.raw_app_meta_data->>'role') in ('admin', 'teacher')
      then lower(new.raw_app_meta_data->>'role')
    else 'teacher'
  end;
  is_pending := selected_role = 'teacher' and new.raw_app_meta_data->>'approval' = 'pending';

  insert into public.profiles (
    auth_user_id,
    first_name,
    last_name,
    email,
    role,
    active,
    approval_status
  )
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      'New'
    ),
    coalesce(nullif(trim(new.raw_user_meta_data->>'last_name'), ''), 'User'),
    new.email,
    selected_role,
    not is_pending,
    case when is_pending then 'pending' else 'approved' end
  )
  on conflict (auth_user_id) do update
    set role = excluded.role,
        email = excluded.email,
        active = excluded.active,
        approval_status = excluded.approval_status
  returning id into created_profile_id;

  if selected_role in ('admin', 'teacher') then
    insert into public.teachers (profile_id)
    values (created_profile_id)
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

-- Staff may edit their own profile (profiles_self_update), but only admins
-- or the service role may change login identity or approval state.
create or replace function public.protect_profile_access_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() and (
    new.username is distinct from old.username
    or new.approval_status is distinct from old.approval_status
    or new.active is distinct from old.active
    or new.email is distinct from old.email
  ) then
    raise exception 'Only administrators can change account access fields.' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.protect_profile_access_fields() from public, anon, authenticated;

drop trigger if exists profiles_protect_access_fields on public.profiles;
create trigger profiles_protect_access_fields
before update on public.profiles
for each row execute function public.protect_profile_access_fields();
