-- Split the Boys/Girls 9-11 classes into a younger and an older class using
-- fixed date-of-birth ranges for the 2026/2027 academic year:
--   9-10  : born 2016-05-01 .. 2017-10-06
--   10-11 : born 2014-10-08 .. 2016-04-30
-- A class with dob_from/dob_to is matched on date of birth; classes without
-- them keep matching on whole-year age (min_age/max_age). Update the dates
-- once a year when classes move up.

alter table public.classes
  add column if not exists dob_from date,
  add column if not exists dob_to date;

alter table public.classes drop constraint if exists classes_dob_range_check;
alter table public.classes
  add constraint classes_dob_range_check
  check ((dob_from is null) = (dob_to is null) and (dob_from is null or dob_from <= dob_to));

-- The existing 9-11 classes become the older group, keeping their attendance
-- history and assigned teachers.
update public.classes
set name = 'Boys 10-11', min_age = 10, max_age = 11, dob_from = '2014-10-08', dob_to = '2016-04-30'
where id = '660e8400-e29b-41d4-a716-446655440102';

update public.classes
set name = 'Girls 10-11', min_age = 10, max_age = 11, dob_from = '2014-10-08', dob_to = '2016-04-30'
where id = '660e8400-e29b-41d4-a716-446655440106';

-- New younger classes, copying the schedule details of the class they split from.
insert into public.classes (id, name, academic_year, term, subject_id, room_location, day_of_week, start_time, end_time, active, gender, min_age, max_age, dob_from, dob_to)
select '660e8400-e29b-41d4-a716-446655440108', 'Boys 9-10', academic_year, term, subject_id, room_location, day_of_week, start_time, end_time, true, 'male', 9, 10, '2016-05-01', '2017-10-06'
from public.classes where id = '660e8400-e29b-41d4-a716-446655440102'
on conflict (id) do nothing;

insert into public.classes (id, name, academic_year, term, subject_id, room_location, day_of_week, start_time, end_time, active, gender, min_age, max_age, dob_from, dob_to)
select '660e8400-e29b-41d4-a716-446655440109', 'Girls 9-10', academic_year, term, subject_id, room_location, day_of_week, start_time, end_time, true, 'female', 9, 10, '2016-05-01', '2017-10-06'
from public.classes where id = '660e8400-e29b-41d4-a716-446655440106'
on conflict (id) do nothing;

-- Move students who fall in the younger range into the new classes.
update public.class_students cs
set class_id = '660e8400-e29b-41d4-a716-446655440108'
from public.students s
where s.id = cs.student_id
  and cs.class_id = '660e8400-e29b-41d4-a716-446655440102'
  and s.date_of_birth between '2016-05-01' and '2017-10-06';

update public.class_students cs
set class_id = '660e8400-e29b-41d4-a716-446655440109'
from public.students s
where s.id = cs.student_id
  and cs.class_id = '660e8400-e29b-41d4-a716-446655440106'
  and s.date_of_birth between '2016-05-01' and '2017-10-06';

-- Bracket review: date-of-birth ranges take precedence over whole-year ages.
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
  cs.override_reason,
  c.dob_from,
  c.dob_to
from public.class_students cs
join public.students s on s.id = cs.student_id
join public.classes c on c.id = cs.class_id
where s.date_of_birth is not null
  and (
    case
      when c.dob_from is not null then s.date_of_birth not between c.dob_from and c.dob_to
      else date_part('year', age(current_date, s.date_of_birth))::int not between c.min_age and c.max_age
    end
    or s.gender is distinct from c.gender
  );

grant select on public.v_students_outside_class_bracket to authenticated;
