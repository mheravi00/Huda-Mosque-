-- Read-only Phase 1B catalog inventory. Safe to run in the Supabase SQL Editor.
-- It reports expected objects that are missing or configured incorrectly.

with expected(name) as (
  values
    ('profiles'), ('guardians'), ('students'), ('student_guardians'),
    ('teachers'), ('subjects'), ('classes'), ('class_teachers'),
    ('class_students'), ('attendance'), ('homework'), ('homework_submissions'),
    ('assessments'), ('assessment_results'), ('student_notes'),
    ('report_templates'), ('report_template_sections'), ('report_requests'),
    ('student_reports'), ('report_sections'), ('messages'),
    ('message_recipients'), ('notifications'), ('calendar_events'),
    ('communication_logs'), ('audit_logs'), ('settings')
)
select 'missing_table' as issue, name as object_name
from expected
where to_regclass(format('public.%I', name)) is null
order by name;

with expected(name) as (
  values
    ('profiles'), ('guardians'), ('students'), ('student_guardians'),
    ('teachers'), ('subjects'), ('classes'), ('class_teachers'),
    ('class_students'), ('attendance'), ('homework'), ('homework_submissions'),
    ('assessments'), ('assessment_results'), ('student_notes'),
    ('report_templates'), ('report_template_sections'), ('report_requests'),
    ('student_reports'), ('report_sections'), ('messages'),
    ('message_recipients'), ('notifications'), ('calendar_events'),
    ('communication_logs'), ('audit_logs'), ('settings')
)
select 'rls_not_enabled' as issue, e.name as object_name
from expected e
join pg_class c on c.oid = to_regclass(format('public.%I', e.name))
where not c.relrowsecurity
order by e.name;

with expected(name) as (
  values
    ('set_updated_at'), ('handle_new_user_profile'), ('is_admin'),
    ('current_profile_id'), ('current_profile_role'), ('is_teacher_for_class'),
    ('is_teacher_for_student'), ('create_audit_entry'), ('safe_uuid'),
    ('can_read_storage_object')
)
select 'missing_function' as issue, e.name as object_name
from expected e
where not exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = e.name
)
order by e.name;

with expected(table_schema, table_name, trigger_name) as (
  values
    ('auth','users','on_auth_user_created'),
    ('public','profiles','profiles_audit'),
    ('public','students','students_audit'),
    ('public','guardians','guardians_audit'),
    ('public','classes','classes_audit'),
    ('public','attendance','attendance_audit'),
    ('public','student_notes','student_notes_audit'),
    ('public','student_reports','reports_audit'),
    ('public','messages','messages_audit'),
    ('public','communication_logs','communications_audit'),
    ('public','profiles','profiles_updated_at'),
    ('public','guardians','guardians_updated_at'),
    ('public','students','students_updated_at'),
    ('public','teachers','teachers_updated_at'),
    ('public','subjects','subjects_updated_at'),
    ('public','classes','classes_updated_at'),
    ('public','attendance','attendance_updated_at'),
    ('public','homework','homework_updated_at'),
    ('public','homework_submissions','homework_submissions_updated_at'),
    ('public','assessments','assessments_updated_at'),
    ('public','assessment_results','assessment_results_updated_at'),
    ('public','report_templates','report_templates_updated_at'),
    ('public','report_requests','report_requests_updated_at'),
    ('public','student_reports','student_reports_updated_at'),
    ('public','messages','messages_updated_at'),
    ('public','notifications','notifications_updated_at'),
    ('public','calendar_events','calendar_events_updated_at'),
    ('public','settings','settings_updated_at')
)
select 'missing_trigger' as issue,
       format('%I.%I.%I', e.table_schema, e.table_name, e.trigger_name) as object_name
from expected e
where not exists (
  select 1
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where not t.tgisinternal
    and n.nspname = e.table_schema
    and c.relname = e.table_name
    and t.tgname = e.trigger_name
)
order by object_name;

with expected(table_schema, table_name, policy_name) as (
  values
    ('public','profiles','profiles_self_select'), ('public','profiles','profiles_self_update'),
    ('public','profiles','profiles_admin_insert'), ('public','profiles','profiles_admin_delete'),
    ('public','guardians','guardians_admin_all'), ('public','guardians','guardians_teacher_select'),
    ('public','students','students_admin_all'), ('public','students','students_teacher_select'),
    ('public','student_guardians','student_guardians_admin_all'), ('public','student_guardians','student_guardians_teacher_select'),
    ('public','teachers','teachers_admin_all'), ('public','teachers','teachers_self_select'),
    ('public','subjects','subjects_authenticated_select'), ('public','subjects','subjects_admin_write'),
    ('public','subjects','subjects_admin_update'), ('public','subjects','subjects_admin_delete'),
    ('public','classes','classes_admin_all'), ('public','classes','classes_teacher_select'),
    ('public','class_teachers','class_teachers_admin_all'), ('public','class_teachers','class_teachers_teacher_select'),
    ('public','class_students','class_students_admin_all'), ('public','class_students','class_students_teacher_select'),
    ('public','attendance','attendance_admin_all'), ('public','attendance','attendance_teacher_all'),
    ('public','homework','homework_admin_all'), ('public','homework','homework_teacher_all'),
    ('public','homework_submissions','homework_submissions_admin_all'), ('public','homework_submissions','homework_submissions_teacher_all'),
    ('public','assessments','assessments_admin_all'), ('public','assessments','assessments_teacher_all'),
    ('public','assessment_results','assessment_results_admin_all'), ('public','assessment_results','assessment_results_teacher_all'),
    ('public','student_notes','notes_admin_all'), ('public','student_notes','notes_teacher_all'),
    ('public','report_templates','report_templates_admin_all'), ('public','report_template_sections','report_template_sections_admin_all'),
    ('public','report_requests','report_requests_admin_all'), ('public','report_requests','report_requests_teacher_select'),
    ('public','student_reports','student_reports_admin_all'), ('public','student_reports','student_reports_teacher_select'),
    ('public','student_reports','student_reports_teacher_update'), ('public','report_sections','report_sections_admin_all'),
    ('public','report_sections','report_sections_teacher_access'), ('public','messages','messages_sender_or_admin'),
    ('public','message_recipients','message_recipients_recipient_or_admin'), ('public','message_recipients','message_recipients_sender_insert'),
    ('public','message_recipients','message_recipients_recipient_update'), ('public','message_recipients','message_recipients_admin_delete'),
    ('public','notifications','notifications_owner_or_admin'), ('public','calendar_events','calendar_events_admin_all'),
    ('public','calendar_events','calendar_events_authenticated_select'), ('public','communication_logs','communication_logs_admin_all'),
    ('public','audit_logs','audit_logs_admin_select'), ('public','settings','settings_admin_all'),
    ('storage','objects','storage_admin_read'), ('storage','objects','storage_teacher_read_assigned'),
    ('storage','objects','storage_admin_insert'), ('storage','objects','storage_admin_update'),
    ('storage','objects','storage_admin_delete')
)
select 'missing_policy' as issue,
       format('%I.%I.%I', e.table_schema, e.table_name, e.policy_name) as object_name
from expected e
where not exists (
  select 1 from pg_policies p
  where p.schemaname = e.table_schema
    and p.tablename = e.table_name
    and p.policyname = e.policy_name
)
order by object_name;

with expected(name) as (
  values
    ('idx_students_student_id'), ('idx_students_last_name'),
    ('idx_attendance_student_id'), ('idx_attendance_date'), ('idx_attendance_class_id'),
    ('idx_homework_class_id'), ('idx_homework_due_date'),
    ('idx_assessments_student_id'), ('idx_assessments_date'), ('idx_assessments_class_id'),
    ('idx_reports_status'), ('idx_reports_teacher_id'), ('idx_reports_student_id'),
    ('idx_reports_report_period'), ('idx_notifications_user_id'),
    ('idx_calendar_events_start_time'), ('idx_student_guardians_student_id'),
    ('idx_student_guardians_guardian_id'), ('idx_class_teachers_teacher_id'),
    ('idx_class_students_student_id'), ('idx_homework_submissions_student_id'),
    ('idx_assessment_results_student_id'), ('idx_message_recipients_recipient_id'),
    ('idx_notifications_user_read'), ('idx_audit_logs_user_created')
)
select 'missing_index' as issue, e.name as object_name
from expected e
where to_regclass(format('public.%I', e.name)) is null
order by e.name;

with expected(name) as (
  values ('student-photos'), ('homework-files'), ('report-pdfs'), ('documents')
)
select case when b.id is null then 'missing_bucket' else 'bucket_is_public' end as issue,
       e.name as object_name
from expected e
left join storage.buckets b on b.id = e.name
where b.id is null or b.public
order by e.name;

-- This final result is informational and helps compare all live constraints
-- (PK, FK, UNIQUE and CHECK) with the initial migration without changing them.
select n.nspname as table_schema,
       c.relname as table_name,
       con.conname as constraint_name,
       pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles','guardians','students','student_guardians','teachers','subjects',
    'classes','class_teachers','class_students','attendance','homework',
    'homework_submissions','assessments','assessment_results','student_notes',
    'report_templates','report_template_sections','report_requests','student_reports',
    'report_sections','messages','message_recipients','notifications','calendar_events',
    'communication_logs','audit_logs','settings'
  )
order by table_name, constraint_name;

-- Final summary: every category should have issue_count = 0.
-- This query is read-only and mirrors the detailed checks above.
select category, issue_count
from (
  select 1 as sort_order,
         'tables'::text as category,
         count(*)::bigint as issue_count
  from (
    values
      ('profiles'), ('guardians'), ('students'), ('student_guardians'),
      ('teachers'), ('subjects'), ('classes'), ('class_teachers'),
      ('class_students'), ('attendance'), ('homework'), ('homework_submissions'),
      ('assessments'), ('assessment_results'), ('student_notes'),
      ('report_templates'), ('report_template_sections'), ('report_requests'),
      ('student_reports'), ('report_sections'), ('messages'),
      ('message_recipients'), ('notifications'), ('calendar_events'),
      ('communication_logs'), ('audit_logs'), ('settings')
  ) as expected(name)
  where to_regclass(format('public.%I', name)) is null

  union all

  select 2,
         'RLS enablement',
         count(*)::bigint
  from (
    values
      ('profiles'), ('guardians'), ('students'), ('student_guardians'),
      ('teachers'), ('subjects'), ('classes'), ('class_teachers'),
      ('class_students'), ('attendance'), ('homework'), ('homework_submissions'),
      ('assessments'), ('assessment_results'), ('student_notes'),
      ('report_templates'), ('report_template_sections'), ('report_requests'),
      ('student_reports'), ('report_sections'), ('messages'),
      ('message_recipients'), ('notifications'), ('calendar_events'),
      ('communication_logs'), ('audit_logs'), ('settings')
  ) as expected(name)
  left join pg_class c
    on c.oid = to_regclass(format('public.%I', expected.name))
  where c.oid is null or not c.relrowsecurity

  union all

  select 3,
         'functions',
         count(*)::bigint
  from (
    values
      ('set_updated_at'), ('handle_new_user_profile'), ('is_admin'),
      ('current_profile_id'), ('current_profile_role'), ('is_teacher_for_class'),
      ('is_teacher_for_student'), ('create_audit_entry'), ('safe_uuid'),
      ('can_read_storage_object')
  ) as expected(name)
  where not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = expected.name
  )

  union all

  select 4,
         'triggers',
         count(*)::bigint
  from (
    values
      ('auth','users','on_auth_user_created'),
      ('public','profiles','profiles_audit'),
      ('public','students','students_audit'),
      ('public','guardians','guardians_audit'),
      ('public','classes','classes_audit'),
      ('public','attendance','attendance_audit'),
      ('public','student_notes','student_notes_audit'),
      ('public','student_reports','reports_audit'),
      ('public','messages','messages_audit'),
      ('public','communication_logs','communications_audit'),
      ('public','profiles','profiles_updated_at'),
      ('public','guardians','guardians_updated_at'),
      ('public','students','students_updated_at'),
      ('public','teachers','teachers_updated_at'),
      ('public','subjects','subjects_updated_at'),
      ('public','classes','classes_updated_at'),
      ('public','attendance','attendance_updated_at'),
      ('public','homework','homework_updated_at'),
      ('public','homework_submissions','homework_submissions_updated_at'),
      ('public','assessments','assessments_updated_at'),
      ('public','assessment_results','assessment_results_updated_at'),
      ('public','report_templates','report_templates_updated_at'),
      ('public','report_requests','report_requests_updated_at'),
      ('public','student_reports','student_reports_updated_at'),
      ('public','messages','messages_updated_at'),
      ('public','notifications','notifications_updated_at'),
      ('public','calendar_events','calendar_events_updated_at'),
      ('public','settings','settings_updated_at')
  ) as expected(table_schema, table_name, trigger_name)
  where not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where not t.tgisinternal
      and n.nspname = expected.table_schema
      and c.relname = expected.table_name
      and t.tgname = expected.trigger_name
  )

  union all

  select 5,
         'policies',
         count(*)::bigint
  from (
    values
      ('public','profiles','profiles_self_select'), ('public','profiles','profiles_self_update'),
      ('public','profiles','profiles_admin_insert'), ('public','profiles','profiles_admin_delete'),
      ('public','guardians','guardians_admin_all'), ('public','guardians','guardians_teacher_select'),
      ('public','students','students_admin_all'), ('public','students','students_teacher_select'),
      ('public','student_guardians','student_guardians_admin_all'), ('public','student_guardians','student_guardians_teacher_select'),
      ('public','teachers','teachers_admin_all'), ('public','teachers','teachers_self_select'),
      ('public','subjects','subjects_authenticated_select'), ('public','subjects','subjects_admin_write'),
      ('public','subjects','subjects_admin_update'), ('public','subjects','subjects_admin_delete'),
      ('public','classes','classes_admin_all'), ('public','classes','classes_teacher_select'),
      ('public','class_teachers','class_teachers_admin_all'), ('public','class_teachers','class_teachers_teacher_select'),
      ('public','class_students','class_students_admin_all'), ('public','class_students','class_students_teacher_select'),
      ('public','attendance','attendance_admin_all'), ('public','attendance','attendance_teacher_all'),
      ('public','homework','homework_admin_all'), ('public','homework','homework_teacher_all'),
      ('public','homework_submissions','homework_submissions_admin_all'), ('public','homework_submissions','homework_submissions_teacher_all'),
      ('public','assessments','assessments_admin_all'), ('public','assessments','assessments_teacher_all'),
      ('public','assessment_results','assessment_results_admin_all'), ('public','assessment_results','assessment_results_teacher_all'),
      ('public','student_notes','notes_admin_all'), ('public','student_notes','notes_teacher_all'),
      ('public','report_templates','report_templates_admin_all'), ('public','report_template_sections','report_template_sections_admin_all'),
      ('public','report_requests','report_requests_admin_all'), ('public','report_requests','report_requests_teacher_select'),
      ('public','student_reports','student_reports_admin_all'), ('public','student_reports','student_reports_teacher_select'),
      ('public','student_reports','student_reports_teacher_update'), ('public','report_sections','report_sections_admin_all'),
      ('public','report_sections','report_sections_teacher_access'), ('public','messages','messages_sender_or_admin'),
      ('public','message_recipients','message_recipients_recipient_or_admin'), ('public','message_recipients','message_recipients_sender_insert'),
      ('public','message_recipients','message_recipients_recipient_update'), ('public','message_recipients','message_recipients_admin_delete'),
      ('public','notifications','notifications_owner_or_admin'), ('public','calendar_events','calendar_events_admin_all'),
      ('public','calendar_events','calendar_events_authenticated_select'), ('public','communication_logs','communication_logs_admin_all'),
      ('public','audit_logs','audit_logs_admin_select'), ('public','settings','settings_admin_all'),
      ('storage','objects','storage_admin_read'), ('storage','objects','storage_teacher_read_assigned'),
      ('storage','objects','storage_admin_insert'), ('storage','objects','storage_admin_update'),
      ('storage','objects','storage_admin_delete')
  ) as expected(table_schema, table_name, policy_name)
  where not exists (
    select 1
    from pg_policies p
    where p.schemaname = expected.table_schema
      and p.tablename = expected.table_name
      and p.policyname = expected.policy_name
  )

  union all

  select 6,
         'indexes',
         count(*)::bigint
  from (
    values
      ('idx_students_student_id'), ('idx_students_last_name'),
      ('idx_attendance_student_id'), ('idx_attendance_date'), ('idx_attendance_class_id'),
      ('idx_homework_class_id'), ('idx_homework_due_date'),
      ('idx_assessments_student_id'), ('idx_assessments_date'), ('idx_assessments_class_id'),
      ('idx_reports_status'), ('idx_reports_teacher_id'), ('idx_reports_student_id'),
      ('idx_reports_report_period'), ('idx_notifications_user_id'),
      ('idx_calendar_events_start_time'), ('idx_student_guardians_student_id'),
      ('idx_student_guardians_guardian_id'), ('idx_class_teachers_teacher_id'),
      ('idx_class_students_student_id'), ('idx_homework_submissions_student_id'),
      ('idx_assessment_results_student_id'), ('idx_message_recipients_recipient_id'),
      ('idx_notifications_user_read'), ('idx_audit_logs_user_created')
  ) as expected(name)
  where to_regclass(format('public.%I', name)) is null

  union all

  select 7,
         'storage buckets',
         count(*)::bigint
  from (
    values ('student-photos'), ('homework-files'), ('report-pdfs'), ('documents')
  ) as expected(name)
  left join storage.buckets b on b.id = expected.name
  where b.id is null or b.public
) summary
order by sort_order;
