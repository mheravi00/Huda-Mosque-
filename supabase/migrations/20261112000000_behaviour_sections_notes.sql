-- Behaviour logs, A/B class sections, admin notes, and student transfers.

-- 1) Behaviour log ---------------------------------------------------------
create table if not exists public.behaviour_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  incident_date date not null default current_date,
  code text not null check (code in ('RFC', 'CWP', 'CWT', 'E/R')),
  reason text not null,
  comment text,
  flagged boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists behaviour_logs_student_idx on public.behaviour_logs (student_id, incident_date desc);

alter table public.behaviour_logs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='behaviour_logs' and policyname='behaviour_admin_all') then
    create policy behaviour_admin_all on public.behaviour_logs for all to authenticated
      using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='behaviour_logs' and policyname='behaviour_teacher_all') then
    create policy behaviour_teacher_all on public.behaviour_logs for all to authenticated
      using (public.is_teacher_for_student(student_id))
      with check (public.is_teacher_for_student(student_id));
  end if;
end $$;

drop trigger if exists behaviour_logs_updated_at on public.behaviour_logs;
create trigger behaviour_logs_updated_at before update on public.behaviour_logs for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.behaviour_logs to authenticated;

-- 2) Admin notes -----------------------------------------------------------
-- Admins have no teachers row, so allow notes with a null teacher_id.
-- The notes_admin_all RLS policy already lets admins read/write every note.
alter table public.student_notes alter column teacher_id drop not null;

-- 3) A/B class sections ----------------------------------------------------
alter table public.classes add column if not exists section text;

-- The old bracket uniqueness blocks a second class per bracket; allow one per section.
alter table public.classes drop constraint if exists classes_bracket_unique;
drop index if exists classes_bracket_section_unique;
create unique index classes_bracket_section_unique
  on public.classes (gender, min_age, max_age, coalesce(section, ''));

-- Give every existing class section 'A' and create an empty 'B' twin.
do $$
declare r record;
begin
  update public.classes set section = 'A' where section is null;
  for r in select * from public.classes where section = 'A' loop
    if not exists (
      select 1 from public.classes b
      where b.gender = r.gender and b.min_age = r.min_age and b.max_age = r.max_age and b.section = 'B'
    ) then
      insert into public.classes (name, academic_year, term, subject_id, room_location, day_of_week, start_time, end_time, active, gender, min_age, max_age, dob_from, dob_to, section)
      values (r.name, r.academic_year, r.term, r.subject_id, r.room_location, r.day_of_week, r.start_time, r.end_time, r.active, r.gender, r.min_age, r.max_age, r.dob_from, r.dob_to, 'B');
    end if;
  end loop;
end $$;

-- 4) Teacher transfers -----------------------------------------------------
-- Let a teacher move a student from a class they teach to another class they teach.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='class_students' and policyname='class_students_teacher_update') then
    create policy class_students_teacher_update on public.class_students for update to authenticated
      using (public.is_teacher_for_class(class_id))
      with check (public.is_teacher_for_class(class_id));
  end if;
end $$;
