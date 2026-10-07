-- Adjust the date-of-birth ranges of the split 9-11 classes for 2026/2027:
--   9-10  (9y to 10y 5m)   : born 2016-05-07 .. 2017-10-07
--   10-11 (10y 6m to 11y 11m): born 2014-11-07 .. 2016-05-06

update public.classes
set dob_from = '2016-05-07', dob_to = '2017-10-07'
where id in ('660e8400-e29b-41d4-a716-446655440108', '660e8400-e29b-41d4-a716-446655440109');

update public.classes
set dob_from = '2014-11-07', dob_to = '2016-05-06'
where id in ('660e8400-e29b-41d4-a716-446655440102', '660e8400-e29b-41d4-a716-446655440106');

-- Re-sort students between the younger and older class under the new ranges.
update public.class_students cs
set class_id = case cs.class_id
  when '660e8400-e29b-41d4-a716-446655440102' then '660e8400-e29b-41d4-a716-446655440108'::uuid
  when '660e8400-e29b-41d4-a716-446655440106' then '660e8400-e29b-41d4-a716-446655440109'::uuid
end
from public.students s
where s.id = cs.student_id
  and cs.class_id in ('660e8400-e29b-41d4-a716-446655440102', '660e8400-e29b-41d4-a716-446655440106')
  and s.date_of_birth between '2016-05-07' and '2017-10-07';

update public.class_students cs
set class_id = case cs.class_id
  when '660e8400-e29b-41d4-a716-446655440108' then '660e8400-e29b-41d4-a716-446655440102'::uuid
  when '660e8400-e29b-41d4-a716-446655440109' then '660e8400-e29b-41d4-a716-446655440106'::uuid
end
from public.students s
where s.id = cs.student_id
  and cs.class_id in ('660e8400-e29b-41d4-a716-446655440108', '660e8400-e29b-41d4-a716-446655440109')
  and s.date_of_birth between '2014-11-07' and '2016-05-06';
