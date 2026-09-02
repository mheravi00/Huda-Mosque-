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
    coalesce(new.raw_user_meta_data->>'role', 'teacher'),
    true
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'admin'
      and p.active = true
  );
$$;

create or replace function public.is_teacher_for_class(class_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id
    join public.profiles p on p.id = t.profile_id
    where ct.class_id = class_uuid
      and p.auth_user_id = auth.uid()
      and p.active = true
  );
$$;

create or replace function public.is_teacher_for_student(student_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.class_students cs
    join public.class_teachers ct on ct.class_id = cs.class_id
    join public.teachers t on t.id = ct.teacher_id
    join public.profiles p on p.id = t.profile_id
    where cs.student_id = student_uuid
      and p.auth_user_id = auth.uid()
      and p.active = true
  );
$$;

create or replace function public.create_audit_entry()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (user_id, action, entity, entity_id, metadata)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce(new.id, old.id),
    jsonb_build_object(
      'table', tg_table_name,
      'record', to_jsonb(coalesce(new, old))
    )
  );

  return coalesce(new, old);
end;
$$;

create trigger trg_profiles_audit
after insert or update or delete on public.profiles
for each row execute function public.create_audit_entry();

create trigger trg_students_audit
after insert or update or delete on public.students
for each row execute function public.create_audit_entry();

create trigger trg_guardians_audit
after insert or update or delete on public.guardians
for each row execute function public.create_audit_entry();

create trigger trg_classes_audit
after insert or update or delete on public.classes
for each row execute function public.create_audit_entry();

create trigger trg_attendance_audit
after insert or update or delete on public.attendance
for each row execute function public.create_audit_entry();

create trigger trg_reports_audit
after insert or update or delete on public.student_reports
for each row execute function public.create_audit_entry();

create trigger trg_messages_audit
after insert or update or delete on public.messages
for each row execute function public.create_audit_entry();

create trigger trg_communications_audit
after insert or update or delete on public.communication_logs
for each row execute function public.create_audit_entry();

create trigger trg_notifications_audit
after insert or update or delete on public.notifications
for each row execute function public.create_audit_entry();

create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_guardians_updated_at before update on public.guardians for each row execute function public.set_updated_at();
create trigger trg_students_updated_at before update on public.students for each row execute function public.set_updated_at();
create trigger trg_teachers_updated_at before update on public.teachers for each row execute function public.set_updated_at();
create trigger trg_subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger trg_classes_updated_at before update on public.classes for each row execute function public.set_updated_at();
create trigger trg_attendance_updated_at before update on public.attendance for each row execute function public.set_updated_at();
create trigger trg_homework_updated_at before update on public.homework for each row execute function public.set_updated_at();
create trigger trg_homework_submissions_updated_at before update on public.homework_submissions for each row execute function public.set_updated_at();
create trigger trg_assessments_updated_at before update on public.assessments for each row execute function public.set_updated_at();
create trigger trg_report_templates_updated_at before update on public.report_templates for each row execute function public.set_updated_at();
create trigger trg_report_requests_updated_at before update on public.report_requests for each row execute function public.set_updated_at();
create trigger trg_student_reports_updated_at before update on public.student_reports for each row execute function public.set_updated_at();
create trigger trg_messages_updated_at before update on public.messages for each row execute function public.set_updated_at();
create trigger trg_notifications_updated_at before update on public.notifications for each row execute function public.set_updated_at();
create trigger trg_calendar_events_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();
create trigger trg_settings_updated_at before update on public.settings for each row execute function public.set_updated_at();

create policy "admins_full_access_profil" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "teachers_can_view_own_profile" on public.profiles for select using (auth_user_id = auth.uid());
create policy "teachers_can_update_own_profile" on public.profiles for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

create policy "admins_full_access_guardians" on public.guardians for all using (public.is_admin()) with check (public.is_admin());
create policy "admins_full_access_students" on public.students for all using (public.is_admin()) with check (public.is_admin());
create policy "teachers_can_view_assigned_students" on public.students for select using (
  exists (
    select 1
    from public.class_students cs
    join public.class_teachers ct on ct.class_id = cs.class_id
    join public.teachers t on t.id = ct.teacher_id
    join public.profiles p on p.id = t.profile_id
    where cs.student_id = students.id and p.auth_user_id = auth.uid()
  )
);
create policy "admins_full_access_classes" on public.classes for all using (public.is_admin()) with check (public.is_admin());
create policy "teachers_can_view_assigned_classes" on public.classes for select using (
  exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id
    join public.profiles p on p.id = t.profile_id
    where ct.class_id = classes.id and p.auth_user_id = auth.uid()
  )
);
create policy "teachers_can_view_assigned_class_students" on public.class_students for select using (
  public.is_teacher_for_class(class_id)
);
create policy "teachers_can_manage_attendance_for_their_classes" on public.attendance for all using (
  public.is_admin() or public.is_teacher_for_class(class_id)
) with check (
  public.is_admin() or public.is_teacher_for_class(class_id)
);
create policy "admins_full_access_report_templates" on public.report_templates for all using (public.is_admin()) with check (public.is_admin());
create policy "admins_full_access_report_requests" on public.report_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "teachers_can_view_assigned_reports" on public.student_reports for select using (
  public.is_admin() or teacher_id = (
    select id from public.profiles where auth_user_id = auth.uid()
  )
);
create policy "teachers_can_update_assigned_reports" on public.student_reports for update using (
  public.is_admin() or teacher_id = (
    select id from public.profiles where auth_user_id = auth.uid()
  )
) with check (
  public.is_admin() or teacher_id = (
    select id from public.profiles where auth_user_id = auth.uid()
  )
);
create policy "admins_full_access_notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());
create policy "teachers_can_view_own_notifications" on public.notifications for select using (
  user_id = (
    select id from public.profiles where auth_user_id = auth.uid()
  )
);
create policy "admins_full_access_messages" on public.messages for all using (public.is_admin()) with check (public.is_admin());
create policy "teachers_can_view_own_messages" on public.messages for select using (
  sender_id = (
    select id from public.profiles where auth_user_id = auth.uid()
  ) or exists (
    select 1
    from public.message_recipients mr
    where mr.message_id = messages.id
      and mr.recipient_id = (
        select id from public.profiles where auth_user_id = auth.uid()
      )
  )
);
create policy "admins_full_access_audit_logs" on public.audit_logs for select using (public.is_admin());
create policy "admins_full_access_settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

create policy "private_student_bucket_access" on storage.objects for select using (
  bucket_id in ('student-photos', 'homework-files', 'report-pdfs', 'documents')
  and (
    public.is_admin() or exists (
      select 1
      from public.profiles p
      where p.auth_user_id = auth.uid()
    )
  )
);

create policy "private_student_bucket_upload" on storage.objects for insert with check (
  bucket_id in ('student-photos', 'homework-files', 'report-pdfs', 'documents')
  and public.is_admin()
);
