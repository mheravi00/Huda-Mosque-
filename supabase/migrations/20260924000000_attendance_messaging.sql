-- Attendance absence tracking + pre-written parent messages.
-- "Told us in advance" is already modelled by attendance.status = 'Excused',
-- so no schema change is needed for that part.

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  trigger_weeks int not null default 1,
  channel text not null default 'email' check (channel in ('email', 'sms', 'both')),
  subject text,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.communication_logs
  add column if not exists template_id uuid references public.message_templates(id);

alter table public.message_templates enable row level security;

create policy message_templates_authenticated_select on public.message_templates for select to authenticated using (auth.uid() is not null);
create policy message_templates_admin_write on public.message_templates for insert to authenticated with check (public.is_admin());
create policy message_templates_admin_update on public.message_templates for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy message_templates_admin_delete on public.message_templates for delete to authenticated using (public.is_admin());

create trigger message_templates_updated_at before update on public.message_templates for each row execute function public.set_updated_at();
create trigger message_templates_audit after insert or update or delete on public.message_templates for each row execute function public.create_audit_entry();

insert into public.message_templates (name, trigger_weeks, channel, subject, body)
values
  (
    'Absence check-in (1 week)',
    1,
    'both',
    'We missed {{student_name}} this week',
    'Assalamu alaikum, we noticed {{student_name}} was absent from {{class_name}} this week. Please let us know if everything is okay. Jazakallah khair, Huda Mosque Madrasa.'
  ),
  (
    'Absence follow-up (3+ weeks)',
    3,
    'both',
    'Following up on {{student_name}}''s attendance',
    'Assalamu alaikum, {{student_name}} has now missed {{weeks_absent}} consecutive weeks of {{class_name}}. Please contact the madrasa office to let us know if we can help, or to update us on their return. Jazakallah khair, Huda Mosque Madrasa.'
  )
on conflict do nothing;

-- Per (class, student), the number of consecutive most-recent sessions
-- recorded as 'Absent'. Ordered by attendance_date desc per group, the
-- streak is every row before the first non-Absent row (or all rows, if
-- none). security_invoker means RLS on public.attendance/students/classes
-- is evaluated against the querying user, same as v_students_outside_class_bracket.
create or replace view public.v_attendance_absence_streaks
with (security_invoker = true) as
with ordered as (
  select
    a.class_id,
    a.student_id,
    a.status,
    a.attendance_date,
    row_number() over (partition by a.class_id, a.student_id order by a.attendance_date desc) as rn
  from public.attendance a
),
first_break as (
  select class_id, student_id, min(rn) as break_rn
  from ordered
  where status <> 'Absent'
  group by class_id, student_id
)
select
  o.class_id,
  c.name as class_name,
  o.student_id,
  s.first_name,
  s.last_name,
  count(*) filter (where o.rn < coalesce(fb.break_rn, 2147483647)) as current_absent_streak,
  (array_agg(o.status order by o.attendance_date desc))[1] as last_status,
  max(o.attendance_date) as last_attendance_date
from ordered o
join public.students s on s.id = o.student_id
join public.classes c on c.id = o.class_id
left join first_break fb on fb.class_id = o.class_id and fb.student_id = o.student_id
group by o.class_id, c.name, o.student_id, s.first_name, s.last_name;

grant select on public.v_attendance_absence_streaks to authenticated;
