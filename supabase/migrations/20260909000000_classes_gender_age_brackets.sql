-- Classes: gender segregation + age brackets.
-- Male: 6-8, 9-11, 12-14, 15-18. Female: 6-8, 9-11, 12-14. Exactly seven classes.

alter table public.classes
  add column if not exists gender text,
  add column if not exists min_age integer,
  add column if not exists max_age integer;

-- The three pre-existing seed classes (Year 3/4/5) plus one ad-hoc production
-- class ("Quran", c8548d11-35d0-443f-870f-4f07ceb299e9 -- confirmed empty:
-- zero rows in class_students/class_teachers/attendance/homework/
-- assessments/report_requests/student_reports) have no gender/age-bracket
-- concept and don't fit the new model. Detach any historical rows that
-- reference them via nullable FKs first, since report_requests.class_id and
-- student_reports.class_id have no "on delete" clause and would otherwise
-- block the delete. class_teachers/class_students/attendance/homework/
-- assessments already cascade-delete.
update public.report_requests set class_id = null
where class_id in (
  '660e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440003',
  'c8548d11-35d0-443f-870f-4f07ceb299e9'
);

update public.student_reports set class_id = null
where class_id in (
  '660e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440003',
  'c8548d11-35d0-443f-870f-4f07ceb299e9'
);

delete from public.classes
where id in (
  '660e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440003',
  'c8548d11-35d0-443f-870f-4f07ceb299e9'
);

insert into public.classes (id, name, academic_year, gender, min_age, max_age, active)
values
  ('660e8400-e29b-41d4-a716-446655440101', 'Boys 6-8',    '2026/2027', 'male',    6,  8, true),
  ('660e8400-e29b-41d4-a716-446655440102', 'Boys 9-11',   '2026/2027', 'male',    9, 11, true),
  ('660e8400-e29b-41d4-a716-446655440103', 'Boys 12-14',  '2026/2027', 'male',   12, 14, true),
  ('660e8400-e29b-41d4-a716-446655440104', 'Boys 15-18',  '2026/2027', 'male',   15, 18, true),
  ('660e8400-e29b-41d4-a716-446655440105', 'Girls 6-8',   '2026/2027', 'female',  6,  8, true),
  ('660e8400-e29b-41d4-a716-446655440106', 'Girls 9-11',  '2026/2027', 'female',  9, 11, true),
  ('660e8400-e29b-41d4-a716-446655440107', 'Girls 12-14', '2026/2027', 'female', 12, 14, true)
on conflict (id) do update set
  name = excluded.name,
  gender = excluded.gender,
  min_age = excluded.min_age,
  max_age = excluded.max_age;

-- If any other classes already exist in a deployed database beyond the three
-- known seed rows above, this will fail loudly here rather than silently
-- deleting unknown data -- those rows need gender/min_age/max_age backfilled
-- (or removed) by hand before this migration can proceed.
alter table public.classes
  alter column gender set not null,
  alter column min_age set not null,
  alter column max_age set not null;

alter table public.classes
  add constraint classes_gender_check check (gender in ('male', 'female')),
  add constraint classes_age_range_check check (min_age >= 0 and max_age >= min_age),
  add constraint classes_bracket_unique unique (gender, min_age, max_age);
