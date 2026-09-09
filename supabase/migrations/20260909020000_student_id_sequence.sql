-- Student IDs: HM0001, HM0002, ... generated in Postgres via a sequence so
-- concurrent inserts cannot collide. Immutable once assigned, never reused.

create sequence if not exists public.student_id_seq;

-- If any students already have HM#### ids, resume the sequence after the
-- highest one so no id is reused or skipped oddly.
do $$
declare max_seq bigint;
begin
  select coalesce(max(substring(student_id from '^HM(\d+)$')::bigint), 0)
  into max_seq
  from public.students
  where student_id ~ '^HM\d+$';

  if max_seq > 0 then
    perform setval('public.student_id_seq', max_seq);
  end if;
end $$;

create or replace function public.set_student_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Always Postgres-generated: any client-supplied student_id is ignored.
  new.student_id := 'HM' || lpad(nextval('public.student_id_seq')::text, 4, '0');
  return new;
end;
$$;

revoke all on function public.set_student_id() from public, anon, authenticated;
revoke all on sequence public.student_id_seq from public, anon, authenticated;

drop trigger if exists students_set_student_id on public.students;
create trigger students_set_student_id
before insert on public.students
for each row execute function public.set_student_id();

create or replace function public.prevent_student_id_change()
returns trigger
language plpgsql
as $$
begin
  if new.student_id is distinct from old.student_id then
    raise exception 'student_id is immutable and cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists students_student_id_immutable on public.students;
create trigger students_student_id_immutable
before update on public.students
for each row execute function public.prevent_student_id_change();
