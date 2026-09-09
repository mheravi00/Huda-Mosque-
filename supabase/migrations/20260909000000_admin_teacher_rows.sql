-- Admin profiles may also act as teachers when they have a linked teachers row.
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

  if selected_role in ('admin', 'teacher') then
    insert into public.teachers (profile_id)
    values (created_profile_id)
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

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

  if target_profile_id is not null then
    insert into public.teachers (profile_id)
    values (target_profile_id)
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

insert into public.teachers (profile_id)
select id
from public.profiles
where role in ('admin', 'teacher')
on conflict (profile_id) do nothing;
