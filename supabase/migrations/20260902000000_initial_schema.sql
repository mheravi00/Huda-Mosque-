create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('admin', 'teacher')),
  profile_photo text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  relationship text,
  phone text,
  email text,
  preferred_contact_method text default 'email',
  receive_reports boolean not null default true,
  receive_attendance_messages boolean not null default true,
  receive_general_messages boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  gender text,
  student_id text not null unique,
  profile_photo text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  enrolment_date date not null default current_date,
  emergency_contact text,
  medical_notes text,
  general_admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, guardian_id)
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  qualification text,
  hire_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  academic_year text not null,
  term text,
  subject_id uuid references public.subjects(id),
  room_location text,
  day_of_week text,
  start_time time,
  end_time time,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_teachers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, teacher_id)
);

create table if not exists public.class_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('Present', 'Absent', 'Late', 'Excused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, student_id, attendance_date)
);

create table if not exists public.homework (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  class_id uuid not null references public.classes(id) on delete cascade,
  assigned_date date not null default current_date,
  due_date date,
  instructions text,
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homework_submissions (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  submitted_at timestamptz,
  status text not null default 'Not completed' check (status in ('Not completed', 'Completed', 'Late')),
  score numeric(5,2),
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (homework_id, student_id)
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid references public.subjects(id),
  assessment_name text not null,
  assessment_date date not null,
  maximum_score numeric(5,2),
  student_score numeric(5,2),
  grade text,
  teacher_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  score numeric(5,2),
  grade text,
  teacher_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, student_id),
  check (score is null or score >= 0)
);

create table if not exists public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  visibility text not null default 'Teacher + Admin' check (visibility in ('Admin only', 'Teacher + Admin'))
);

create table if not exists public.report_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_template_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.report_templates(id) on delete cascade,
  section_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.report_requests (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id),
  report_period text not null,
  report_type text not null check (report_type in ('Weekly', 'Monthly')),
  deadline date,
  status text not null default 'Open' check (status in ('Open', 'Assigned', 'Completed', 'Closed')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id),
  subject_id uuid references public.subjects(id),
  report_period text not null,
  status text not null default 'Draft' check (status in ('Draft', 'Submitted', 'Under Review', 'Changes Requested', 'Approved', 'Sent')),
  attendance_present int default 0,
  attendance_absent int default 0,
  attendance_late int default 0,
  attendance_excused int default 0,
  attendance_percentage numeric(5,2) default 0,
  grade text,
  score numeric(5,2),
  progress text,
  strengths text,
  areas_for_improvement text,
  behaviour text,
  teacher_comments text,
  targets text[],
  admin_comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.student_reports(id) on delete cascade,
  section_name text not null,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  subject text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.message_recipients (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (message_id, recipient_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read_at timestamptz,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id),
  title text not null,
  description text,
  event_type text not null default 'class',
  start_time timestamptz not null,
  end_time timestamptz,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id),
  guardian_id uuid references public.guardians(id),
  report_id uuid references public.student_reports(id),
  communication_type text not null check (communication_type in ('email', 'sms')),
  recipient text not null,
  provider text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'delivered', 'failed')),
  sent_at timestamptz,
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_students_student_id on public.students(student_id);
create index if not exists idx_students_last_name on public.students(last_name);
create index if not exists idx_attendance_student_id on public.attendance(student_id);
create index if not exists idx_attendance_date on public.attendance(attendance_date);
create index if not exists idx_attendance_class_id on public.attendance(class_id);
create index if not exists idx_homework_class_id on public.homework(class_id);
create index if not exists idx_homework_due_date on public.homework(due_date);
create index if not exists idx_assessments_student_id on public.assessments(student_id);
create index if not exists idx_assessments_date on public.assessments(assessment_date);
create index if not exists idx_reports_status on public.student_reports(status);
create index if not exists idx_reports_teacher_id on public.student_reports(teacher_id);
create index if not exists idx_reports_student_id on public.student_reports(student_id);
create index if not exists idx_reports_report_period on public.student_reports(report_period);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_calendar_events_start_time on public.calendar_events(start_time);
create index if not exists idx_student_guardians_student_id on public.student_guardians(student_id);
create index if not exists idx_student_guardians_guardian_id on public.student_guardians(guardian_id);
create index if not exists idx_class_teachers_teacher_id on public.class_teachers(teacher_id);
create index if not exists idx_class_students_student_id on public.class_students(student_id);
create index if not exists idx_homework_submissions_student_id on public.homework_submissions(student_id);
create index if not exists idx_assessments_class_id on public.assessments(class_id);
create index if not exists idx_assessment_results_student_id on public.assessment_results(student_id);
create index if not exists idx_message_recipients_recipient_id on public.message_recipients(recipient_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read_at);
create index if not exists idx_audit_logs_user_created on public.audit_logs(user_id, created_at);
