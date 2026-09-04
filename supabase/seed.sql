insert into public.profiles (id, auth_user_id, first_name, last_name, email, phone, role, active)
values
  ('11111111-1111-4111-8111-111111111111', null, 'Admin', 'User', 'admin@example.com', '+123456789', 'admin', true),
  ('22222222-2222-4222-8222-222222222222', null, 'Teacher', 'One', 'teacher1@example.com', '+123456780', 'teacher', true),
  ('33333333-3333-4333-8333-333333333333', null, 'Teacher', 'Two', 'teacher2@example.com', '+123456781', 'teacher', true),
  ('44444444-4444-4444-8444-444444444444', null, 'Teacher', 'Three', 'teacher3@example.com', '+123456782', 'teacher', true)
on conflict (email) do nothing;

insert into public.teachers (id, profile_id, qualification, hire_date)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'Qur’an & Tajweed', '2023-09-01'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '33333333-3333-4333-8333-333333333333', 'Islamic Studies', '2022-01-15'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '44444444-4444-4444-8444-444444444444', 'Arabic & Fiqh', '2024-02-05')
on conflict (profile_id) do nothing;

insert into public.subjects (id, name, description, active)
values
  ('550e8400-e29b-41d4-a716-446655440001', 'Qur’an', 'Qur’an recitation and memorisation', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Islamic Studies', 'Islamic knowledge and principles', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Arabic', 'Arabic language basics', true)
on conflict (name) do nothing;

insert into public.classes (id, name, academic_year, term, subject_id, room_location, day_of_week, start_time, end_time, active)
values
  ('660e8400-e29b-41d4-a716-446655440001', 'Year 3 Qur’an', '2026/2027', 'Term 1', '550e8400-e29b-41d4-a716-446655440001', 'Room 1', 'Saturday', '10:00:00', '11:00:00', true),
  ('660e8400-e29b-41d4-a716-446655440002', 'Year 4 Qur’an', '2026/2027', 'Term 1', '550e8400-e29b-41d4-a716-446655440001', 'Room 2', 'Sunday', '09:00:00', '10:00:00', true),
  ('660e8400-e29b-41d4-a716-446655440003', 'Year 5 Islamic Studies', '2026/2027', 'Term 1', '550e8400-e29b-41d4-a716-446655440002', 'Room 3', 'Friday', '15:00:00', '16:00:00', true)
on conflict do nothing;

insert into public.guardians (id, first_name, last_name, relationship, phone, email, preferred_contact_method, receive_reports, receive_attendance_messages, receive_general_messages)
values
  ('770e8400-e29b-41d4-a716-446655440001', 'Fatima', 'Khan', 'Mother', '+440700000000', 'fatima@example.com', 'email', true, true, true),
  ('770e8400-e29b-41d4-a716-446655440002', 'Ahmed', 'Ali', 'Father', '+440700000001', 'ahmed@example.com', 'sms', true, true, false),
  ('770e8400-e29b-41d4-a716-446655440003', 'Nadia', 'Yusuf', 'Mother', '+440700000002', 'nadia@example.com', 'email', true, true, true),
  ('770e8400-e29b-41d4-a716-446655440004', 'Hassan', 'Rahman', 'Father', '+440700000003', 'hassan@example.com', 'sms', true, false, true),
  ('770e8400-e29b-41d4-a716-446655440005', 'Sadia', 'Mansoor', 'Guardian', '+440700000004', 'sadia@example.com', 'email', true, true, true)
on conflict do nothing;
