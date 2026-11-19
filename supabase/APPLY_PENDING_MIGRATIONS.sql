-- ============================================================
-- Huda Portal — pending database change (run after the earlier ones).
-- Paste this whole file into the Supabase SQL Editor and Run.
-- Safe to run more than once.
-- Reverts the A/B class split, adds Feedback and class Topics/Syllabus.
-- ============================================================

-- Revert A/B class sections back to one class per bracket, add feedback and class syllabus.

-- 1) Revert A/B sections ----------------------------------------------------
do $$
declare r record;
begin
  for r in select * from public.classes where section = 'B' loop
    -- Move B students into the matching A class (skip any already in A).
    update public.class_students cs
      set class_id = a.id
      from public.classes a
      where a.gender = r.gender and a.min_age = r.min_age and a.max_age = r.max_age and coalesce(a.section,'A') = 'A'
        and cs.class_id = r.id
        and not exists (select 1 from public.class_students x where x.class_id = a.id and x.student_id = cs.student_id);
    -- Drop any leftover B memberships + teachers.
    delete from public.class_students where class_id = r.id;
    delete from public.class_teachers where class_id = r.id;
    -- Delete the empty B class only when nothing else references it; otherwise just hide it.
    if not exists (select 1 from public.attendance where class_id = r.id)
       and not exists (select 1 from public.homework where class_id = r.id)
       and not exists (select 1 from public.assessments where class_id = r.id)
       and not exists (select 1 from public.student_reports where class_id = r.id)
       and not exists (select 1 from public.report_requests where class_id = r.id) then
      delete from public.classes where id = r.id;
    else
      update public.classes set active = false where id = r.id;
    end if;
  end loop;
  -- Flatten the remaining classes back to a single, section-less class per bracket.
  update public.classes set section = null;
end $$;

-- 2) Feedback --------------------------------------------------------------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  problem text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists feedback_admin_all on public.feedback;
create policy feedback_admin_all on public.feedback for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback for insert to authenticated with check (created_by = public.current_profile_id());
drop policy if exists feedback_own_select on public.feedback;
create policy feedback_own_select on public.feedback for select to authenticated using (created_by = public.current_profile_id());
grant select, insert, update, delete on public.feedback to authenticated;

-- 3) Class syllabus / curriculum -------------------------------------------
create table if not exists public.class_curriculum (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  academic_year text,
  term text,
  topic text not null,
  currently_studying boolean not null default true,
  learning_points text,
  current_reading text,
  teacher_name text,
  start_date date,
  end_date date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists class_curriculum_class_idx on public.class_curriculum (class_id, created_at);
alter table public.class_curriculum enable row level security;
drop policy if exists curriculum_admin_all on public.class_curriculum;
create policy curriculum_admin_all on public.class_curriculum for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists curriculum_teacher_all on public.class_curriculum;
create policy curriculum_teacher_all on public.class_curriculum for all to authenticated
  using (public.is_teacher_for_class(class_id)) with check (public.is_teacher_for_class(class_id));
drop trigger if exists class_curriculum_updated_at on public.class_curriculum;
create trigger class_curriculum_updated_at before update on public.class_curriculum for each row execute function public.set_updated_at();
grant select, insert, update, delete on public.class_curriculum to authenticated;
