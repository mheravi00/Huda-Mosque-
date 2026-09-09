-- Class assignment stays admin-only (already enforced by the existing
-- class_students_admin_all RLS policy -- no RLS change needed here) but now
-- records who assigned the class and, when the admin overrides the age/gender
-- bracket match, why.

alter table public.class_students
  add column if not exists assigned_by uuid references public.profiles(id),
  add column if not exists override_reason text;

create or replace function public.set_class_assignment_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_by is null then
    new.assigned_by := public.current_profile_id();
  end if;
  return new;
end;
$$;

revoke all on function public.set_class_assignment_admin() from public, anon, authenticated;

drop trigger if exists class_students_set_assigned_by on public.class_students;
create trigger class_students_set_assigned_by
before insert on public.class_students
for each row execute function public.set_class_assignment_admin();

-- Admin review: students whose current age (derived from date_of_birth, never
-- stored) falls outside their assigned class's bracket, or whose gender no
-- longer matches the class's gender. This is a flag for an admin to review at
-- the start of a term -- it never reassigns anything itself.
-- security_invoker means RLS on the underlying tables is evaluated against
-- the querying user (not the view owner), so admins see everything and
-- teachers only see their own assigned students/classes, same as querying
-- the base tables directly.
create or replace view public.v_students_outside_class_bracket
with (security_invoker = true) as
select
  cs.id as class_student_id,
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.gender as student_gender,
  s.date_of_birth,
  date_part('year', age(current_date, s.date_of_birth))::int as current_age,
  c.id as class_id,
  c.name as class_name,
  c.gender as class_gender,
  c.min_age,
  c.max_age,
  cs.override_reason
from public.class_students cs
join public.students s on s.id = cs.student_id
join public.classes c on c.id = cs.class_id
where s.date_of_birth is not null
  and (
    date_part('year', age(current_date, s.date_of_birth))::int < c.min_age
    or date_part('year', age(current_date, s.date_of_birth))::int > c.max_age
    or s.gender is distinct from c.gender
  );

grant select on public.v_students_outside_class_bracket to authenticated;
