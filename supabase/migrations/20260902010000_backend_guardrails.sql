-- Security hardening migration. All policies are relationship-based and deny by default.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- A new signup is always a teacher. Only trusted server-side admin tooling may promote a profile.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, first_name, last_name, email, role, active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'New'),
    coalesce(new.raw_user_meta_data->>'last_name', 'User'),
    new.email,
    'teacher',
    true
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid() and role = 'admin' and active = true
  );
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid() and active = true limit 1;
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where auth_user_id = auth.uid() and active = true limit 1;
$$;

create or replace function public.is_teacher_for_class(class_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id
    join public.profiles p on p.id = t.profile_id
    where ct.class_id = class_uuid and p.auth_user_id = auth.uid() and p.role = 'teacher' and p.active = true
  );
$$;

create or replace function public.is_teacher_for_student(student_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_students cs
    join public.class_teachers ct on ct.class_id = cs.class_id
    join public.teachers t on t.id = ct.teacher_id
    join public.profiles p on p.id = t.profile_id
    where cs.student_id = student_uuid and p.auth_user_id = auth.uid() and p.role = 'teacher' and p.active = true
  );
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.current_profile_id() from public, anon;
revoke all on function public.is_teacher_for_class(uuid) from public, anon;
revoke all on function public.is_teacher_for_student(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.is_teacher_for_class(uuid) to authenticated;
grant execute on function public.is_teacher_for_student(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.students enable row level security;
alter table public.student_guardians enable row level security;
alter table public.teachers enable row level security;
alter table public.subjects enable row level security;
alter table public.classes enable row level security;
alter table public.class_teachers enable row level security;
alter table public.class_students enable row level security;
alter table public.attendance enable row level security;
alter table public.homework enable row level security;
alter table public.homework_submissions enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_results enable row level security;
alter table public.student_notes enable row level security;
alter table public.report_templates enable row level security;
alter table public.report_template_sections enable row level security;
alter table public.report_requests enable row level security;
alter table public.student_reports enable row level security;
alter table public.report_sections enable row level security;
alter table public.messages enable row level security;
alter table public.message_recipients enable row level security;
alter table public.notifications enable row level security;
alter table public.calendar_events enable row level security;
alter table public.communication_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.settings enable row level security;

-- Remove policies from earlier development migrations so permissive policies cannot remain active.
do $$
declare policy_record record;
begin
  for policy_record in
    select policyname, tablename from pg_policies where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.%I', policy_record.policyname, policy_record.tablename);
  end loop;
end $$;

do $$
declare policy_record record;
begin
  for policy_record in
    select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects', policy_record.policyname);
  end loop;
end $$;

-- Profiles: users can see/update only themselves; admins manage all profiles.
create policy profiles_self_select on public.profiles for select to authenticated using (auth_user_id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (auth_user_id = auth.uid() or public.is_admin()) with check ((auth_user_id = auth.uid() and role = public.current_profile_role()) or public.is_admin());
create policy profiles_admin_insert on public.profiles for insert to authenticated with check (public.is_admin());
create policy profiles_admin_delete on public.profiles for delete to authenticated using (public.is_admin());

-- Administrative records.
create policy guardians_admin_all on public.guardians for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy students_admin_all on public.students for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy students_teacher_select on public.students for select to authenticated using (public.is_teacher_for_student(id));
create policy student_guardians_admin_all on public.student_guardians for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy student_guardians_teacher_select on public.student_guardians for select to authenticated using (public.is_teacher_for_student(student_id));
create policy guardians_teacher_select on public.guardians for select to authenticated using (
  exists (
    select 1 from public.student_guardians sg
    where sg.guardian_id = guardians.id and public.is_teacher_for_student(sg.student_id)
  )
);
create policy teachers_admin_all on public.teachers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy teachers_self_select on public.teachers for select to authenticated using (profile_id = public.current_profile_id() or public.is_admin());
create policy subjects_authenticated_select on public.subjects for select to authenticated using (auth.uid() is not null);
create policy subjects_admin_write on public.subjects for insert to authenticated with check (public.is_admin());
create policy subjects_admin_update on public.subjects for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy subjects_admin_delete on public.subjects for delete to authenticated using (public.is_admin());
create policy classes_admin_all on public.classes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy classes_teacher_select on public.classes for select to authenticated using (public.is_teacher_for_class(id));
create policy class_teachers_admin_all on public.class_teachers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy class_teachers_teacher_select on public.class_teachers for select to authenticated using (public.is_teacher_for_class(class_id));
create policy class_students_admin_all on public.class_students for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy class_students_teacher_select on public.class_students for select to authenticated using (public.is_teacher_for_class(class_id));

-- Teacher operational access is tied to the assigned class/student relationship.
create policy attendance_admin_all on public.attendance for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy attendance_teacher_all on public.attendance for all to authenticated using (public.is_teacher_for_class(class_id)) with check (public.is_teacher_for_class(class_id) and public.is_teacher_for_student(student_id));
create policy homework_admin_all on public.homework for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy homework_teacher_all on public.homework for all to authenticated using (public.is_teacher_for_class(class_id)) with check (public.is_teacher_for_class(class_id));
create policy homework_submissions_admin_all on public.homework_submissions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy homework_submissions_teacher_all on public.homework_submissions for all to authenticated using (exists (select 1 from public.homework h where h.id = homework_id and public.is_teacher_for_class(h.class_id))) with check (exists (select 1 from public.homework h where h.id = homework_id and public.is_teacher_for_class(h.class_id) and public.is_teacher_for_student(student_id)));
create policy assessments_admin_all on public.assessments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy assessments_teacher_all on public.assessments for all to authenticated using (public.is_teacher_for_class(class_id)) with check (public.is_teacher_for_class(class_id) and public.is_teacher_for_student(student_id));
create policy assessment_results_admin_all on public.assessment_results for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy assessment_results_teacher_all on public.assessment_results for all to authenticated using (exists (select 1 from public.assessments a where a.id = assessment_id and public.is_teacher_for_student(a.student_id))) with check (public.is_teacher_for_student(student_id));
create policy notes_admin_all on public.student_notes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy notes_teacher_all on public.student_notes for all to authenticated using (public.is_teacher_for_student(student_id) and teacher_id = (select id from public.teachers where profile_id = public.current_profile_id())) with check (public.is_teacher_for_student(student_id) and teacher_id = (select id from public.teachers where profile_id = public.current_profile_id()));

-- Reports.
create policy report_templates_admin_all on public.report_templates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy report_template_sections_admin_all on public.report_template_sections for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy report_requests_admin_all on public.report_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy report_requests_teacher_select on public.report_requests for select to authenticated using (class_id is null or public.is_teacher_for_class(class_id));
create policy student_reports_admin_all on public.student_reports for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy student_reports_teacher_select on public.student_reports for select to authenticated using (teacher_id = public.current_profile_id() and public.is_teacher_for_student(student_id));
create policy student_reports_teacher_update on public.student_reports for update to authenticated using (teacher_id = public.current_profile_id() and status in ('Draft', 'Changes Requested')) with check (teacher_id = public.current_profile_id() and status in ('Draft', 'Submitted'));
create policy report_sections_admin_all on public.report_sections for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy report_sections_teacher_access on public.report_sections for select to authenticated using (exists (select 1 from public.student_reports r where r.id = report_id and r.teacher_id = public.current_profile_id()));

-- Internal communication and personal notifications.
create policy messages_sender_or_admin on public.messages for all to authenticated using (public.is_admin() or sender_id = public.current_profile_id()) with check (public.is_admin() or sender_id = public.current_profile_id());
create policy message_recipients_recipient_or_admin on public.message_recipients for select to authenticated using (public.is_admin() or recipient_id = public.current_profile_id());
create policy message_recipients_sender_insert on public.message_recipients for insert to authenticated with check (public.is_admin() or exists (select 1 from public.messages m where m.id = message_id and m.sender_id = public.current_profile_id()));
create policy message_recipients_recipient_update on public.message_recipients for update to authenticated using (public.is_admin() or recipient_id = public.current_profile_id()) with check (public.is_admin() or recipient_id = public.current_profile_id());
create policy message_recipients_admin_delete on public.message_recipients for delete to authenticated using (public.is_admin());
create policy notifications_owner_or_admin on public.notifications for all to authenticated using (public.is_admin() or user_id = public.current_profile_id()) with check (public.is_admin() or user_id = public.current_profile_id());
create policy calendar_events_admin_all on public.calendar_events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy calendar_events_authenticated_select on public.calendar_events for select to authenticated using (auth.uid() is not null);
create policy communication_logs_admin_all on public.communication_logs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy audit_logs_admin_select on public.audit_logs for select to authenticated using (public.is_admin());
create policy settings_admin_all on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Audit history cannot be changed through the API.
revoke insert, update, delete on public.audit_logs from anon, authenticated;

create or replace function public.create_audit_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then return coalesce(new, old); end if;
  insert into public.audit_logs (user_id, action, entity, entity_id, metadata)
  values (public.current_profile_id(), tg_op, tg_table_name, coalesce(new.id, old.id), jsonb_build_object('table', tg_table_name));
  return coalesce(new, old);
end;
$$;

revoke all on function public.create_audit_entry() from public, anon, authenticated;

create trigger profiles_audit after insert or update or delete on public.profiles for each row execute function public.create_audit_entry();
create trigger students_audit after insert or update or delete on public.students for each row execute function public.create_audit_entry();
create trigger guardians_audit after insert or update or delete on public.guardians for each row execute function public.create_audit_entry();
create trigger classes_audit after insert or update or delete on public.classes for each row execute function public.create_audit_entry();
create trigger attendance_audit after insert or update or delete on public.attendance for each row execute function public.create_audit_entry();
create trigger reports_audit after insert or update or delete on public.student_reports for each row execute function public.create_audit_entry();
create trigger messages_audit after insert or update or delete on public.messages for each row execute function public.create_audit_entry();
create trigger communications_audit after insert or update or delete on public.communication_logs for each row execute function public.create_audit_entry();

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger guardians_updated_at before update on public.guardians for each row execute function public.set_updated_at();
create trigger students_updated_at before update on public.students for each row execute function public.set_updated_at();
create trigger teachers_updated_at before update on public.teachers for each row execute function public.set_updated_at();
create trigger subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger classes_updated_at before update on public.classes for each row execute function public.set_updated_at();
create trigger attendance_updated_at before update on public.attendance for each row execute function public.set_updated_at();
create trigger homework_updated_at before update on public.homework for each row execute function public.set_updated_at();
create trigger homework_submissions_updated_at before update on public.homework_submissions for each row execute function public.set_updated_at();
create trigger assessments_updated_at before update on public.assessments for each row execute function public.set_updated_at();
create trigger assessment_results_updated_at before update on public.assessment_results for each row execute function public.set_updated_at();
create trigger report_templates_updated_at before update on public.report_templates for each row execute function public.set_updated_at();
create trigger report_requests_updated_at before update on public.report_requests for each row execute function public.set_updated_at();
create trigger student_reports_updated_at before update on public.student_reports for each row execute function public.set_updated_at();
create trigger messages_updated_at before update on public.messages for each row execute function public.set_updated_at();
create trigger notifications_updated_at before update on public.notifications for each row execute function public.set_updated_at();
create trigger calendar_events_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.settings for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values
  ('student-photos', 'student-photos', false),
  ('homework-files', 'homework-files', false),
  ('report-pdfs', 'report-pdfs', false),
  ('documents', 'documents', false)
on conflict (id) do update set public = false;

create or replace function public.safe_uuid(value text)
returns uuid
language plpgsql
immutable
as $$
begin
  return value::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

revoke all on function public.safe_uuid(text) from public, anon;
grant execute on function public.safe_uuid(text) to authenticated;

create policy storage_admin_read on storage.objects for select to authenticated using (bucket_id in ('student-photos', 'homework-files', 'report-pdfs', 'documents') and public.is_admin());
create or replace function public.can_read_storage_object(object_bucket text, object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or (
      public.current_profile_role() = 'teacher'
      and (
        (split_part(object_name, '/', 1) = 'students' and public.is_teacher_for_student(public.safe_uuid(split_part(object_name, '/', 2))))
        or (split_part(object_name, '/', 1) = 'classes' and public.is_teacher_for_class(public.safe_uuid(split_part(object_name, '/', 2))))
        or (split_part(object_name, '/', 1) = 'reports' and exists (
          select 1 from public.student_reports r
          where r.id = public.safe_uuid(split_part(object_name, '/', 2))
            and r.teacher_id = public.current_profile_id()
        ))
      )
    );
$$;

revoke all on function public.can_read_storage_object(text, text) from public, anon;
grant execute on function public.can_read_storage_object(text, text) to authenticated;

create policy storage_teacher_read_assigned on storage.objects for select to authenticated using (
  bucket_id in ('homework-files', 'student-photos', 'report-pdfs', 'documents')
  and public.can_read_storage_object(bucket_id, name)
);
create policy storage_admin_insert on storage.objects for insert to authenticated with check (bucket_id in ('student-photos', 'homework-files', 'report-pdfs', 'documents') and public.is_admin());
create policy storage_admin_update on storage.objects for update to authenticated using (bucket_id in ('student-photos', 'homework-files', 'report-pdfs', 'documents') and public.is_admin()) with check (bucket_id in ('student-photos', 'homework-files', 'report-pdfs', 'documents') and public.is_admin());
create policy storage_admin_delete on storage.objects for delete to authenticated using (bucket_id in ('student-photos', 'homework-files', 'report-pdfs', 'documents') and public.is_admin());
