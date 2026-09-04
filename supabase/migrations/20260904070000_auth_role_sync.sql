-- Provision application access from Supabase Auth users.
-- Roles come from raw_app_meta_data because users cannot edit app metadata.

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role text;
  created_profile_id uuid;
begin
  selected_role := case
    when lower(new.raw_app_meta_data->>'role') in ('admin', 'teacher')
      then lower(new.raw_app_meta_data->>'role')
    else 'teacher'
  end;

  insert into public.profiles (
    auth_user_id,
    first_name,
    last_name,
    email,
    role,
    active
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
    true
  )
  on conflict (auth_user_id) do update
    set role = excluded.role,
        email = excluded.email,
        active = true
  returning id into created_profile_id;

  if selected_role = 'teacher' then
    insert into public.teachers (profile_id)
    values (created_profile_id)
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.sync_auth_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role text;
  target_profile_id uuid;
begin
  selected_role := lower(new.raw_app_meta_data->>'role');

  if selected_role not in ('admin', 'teacher') then
    return new;
  end if;

  update public.profiles
  set role = selected_role,
      updated_at = now()
  where auth_user_id = new.id
  returning id into target_profile_id;

  if selected_role = 'teacher' and target_profile_id is not null then
    insert into public.teachers (profile_id)
    values (target_profile_id)
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_auth_user_role() from public, anon, authenticated;

drop trigger if exists on_auth_user_role_updated on auth.users;
create trigger on_auth_user_role_updated
after update of raw_app_meta_data on auth.users
for each row
when (old.raw_app_meta_data is distinct from new.raw_app_meta_data)
execute function public.sync_auth_user_role();

-- Repair teacher rows for Auth users created before this migration.
insert into public.teachers (profile_id)
select profiles.id
from public.profiles
where profiles.role = 'teacher'
on conflict (profile_id) do nothing;
