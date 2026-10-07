-- GoTrue inserts auth.users before applying app_metadata, so the role and
-- approval flags are not visible to this trigger. Every new login therefore
-- starts inactive and pending; the API approves admin-created staff straight
-- away and leaves self-service teacher requests pending for review.
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
    false,
    'pending'
  )
  on conflict (auth_user_id) do update
    set email = excluded.email
  returning id into created_profile_id;

  if selected_role in ('admin', 'teacher') then
    insert into public.teachers (profile_id)
    values (created_profile_id)
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;
