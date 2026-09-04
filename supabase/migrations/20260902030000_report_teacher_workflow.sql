do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_reports' and policyname='student_reports_teacher_insert') then
    create policy student_reports_teacher_insert on public.student_reports for insert to authenticated
    with check (teacher_id=public.current_profile_id() and status='Draft' and public.is_teacher_for_student(student_id) and (class_id is null or public.is_teacher_for_class(class_id)));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='report_sections' and policyname='report_sections_teacher_insert') then
    create policy report_sections_teacher_insert on public.report_sections for insert to authenticated
    with check (exists(select 1 from public.student_reports r where r.id=report_id and r.teacher_id=public.current_profile_id() and r.status in ('Draft','Changes Requested')));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='report_sections' and policyname='report_sections_teacher_update') then
    create policy report_sections_teacher_update on public.report_sections for update to authenticated
    using (exists(select 1 from public.student_reports r where r.id=report_id and r.teacher_id=public.current_profile_id() and r.status in ('Draft','Changes Requested')))
    with check (exists(select 1 from public.student_reports r where r.id=report_id and r.teacher_id=public.current_profile_id() and r.status in ('Draft','Changes Requested')));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='report_sections' and policyname='report_sections_teacher_delete') then
    create policy report_sections_teacher_delete on public.report_sections for delete to authenticated
    using (exists(select 1 from public.student_reports r where r.id=report_id and r.teacher_id=public.current_profile_id() and r.status in ('Draft','Changes Requested')));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='messages' and policyname='messages_recipient_select') then
    create policy messages_recipient_select on public.messages for select to authenticated
    using (exists(select 1 from public.message_recipients mr where mr.message_id=id and mr.recipient_id=public.current_profile_id()));
  end if;
end $$;

alter policy notes_teacher_all on public.student_notes
using (
  visibility='Teacher + Admin'
  and public.is_teacher_for_student(student_id)
  and teacher_id=(select id from public.teachers where profile_id=public.current_profile_id())
)
with check (
  visibility='Teacher + Admin'
  and public.is_teacher_for_student(student_id)
  and teacher_id=(select id from public.teachers where profile_id=public.current_profile_id())
);
