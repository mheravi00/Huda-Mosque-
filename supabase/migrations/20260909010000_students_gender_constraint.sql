-- Constrain students.gender to match classes.gender so class-dropdown
-- filtering can compare the two directly.

do $$
declare affected int;
begin
  update public.students
  set gender = lower(trim(gender))
  where gender is not null;

  update public.students
  set gender = null
  where gender is not null and gender not in ('male', 'female');
  get diagnostics affected = row_count;

  if affected > 0 then
    raise notice 'students_gender_constraint: % row(s) had an unrecognized gender value and were set to null', affected;
  end if;
end $$;

alter table public.students
  add constraint students_gender_check check (gender in ('male', 'female'));
