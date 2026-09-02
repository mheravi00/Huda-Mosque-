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

alter table public.profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.students enable row level security;
alter table public.student_guardians enable row level security;
alter table public.teachers enable row level security;
alter table public.subjects enable row level security;
alter table public.classes enable row level security;
alter table public.class_teachers enable row level security;
alter table public.class_students enable row level security;
alter table public.attendance enable row level security;
alter table public.homework enable row level security;
alter table public.homework_submissions enable row level security;
alter table public.assessments enable row level security;
alter table public.student_notes enable row level security;
alter table public.report_templates enable row level security;
alter table public.report_template_sections enable row level security;
alter table public.report_requests enable row level security;
alter table public.student_reports enable row level security;
alter table public.report_sections enable row level security;
alter table public.messages enable row level security;
alter table public.message_recipients enable row level security;
alter table public.notifications enable row level security;
alter table public.calendar_events enable row level security;
alter table public.communication_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.settings enable row level security;

create policy "profiles_are_readable_by_admins" on public.profiles for select using (true);
create policy "profile_self_access" on public.profiles for select using (auth_user_id = auth.uid());
create policy "admin_manage_profiles" on public.profiles for all using (true) with check (true);

create policy "admin_manage_guardians" on public.guardians for all using (true) with check (true);
create policy "admin_manage_students" on public.students for all using (true) with check (true);
create policy "admin_manage_classes" on public.classes for all using (true) with check (true);
create policy "admin_manage_reports" on public.student_reports for all using (true) with check (true);
create policy "teacher_access_assigned_data" on public.attendance for select using (true);
create policy "teacher_manage_assigned_attendance" on public.attendance for update using (true) with check (true);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_guardians_updated_at before update on public.guardians for each row execute function public.set_updated_at();
create trigger trg_students_updated_at before update on public.students for each row execute function public.set_updated_at();
create trigger trg_teachers_updated_at before update on public.teachers for each row execute function public.set_updated_at();
create trigger trg_subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger trg_classes_updated_at before update on public.classes for each row execute function public.set_updated_at();
create trigger trg_attendance_updated_at before update on public.attendance for each row execute function public.set_updated_at();
create trigger trg_homework_updated_at before update on public.homework for each row execute function public.set_updated_at();
create trigger trg_homework_submissions_updated_at before update on public.homework_submissions for each row execute function public.set_updated_at();
create trigger trg_assessments_updated_at before update on public.assessments for each row execute function public.set_updated_at();
create trigger trg_report_templates_updated_at before update on public.report_templates for each row execute function public.set_updated_at();
create trigger trg_report_requests_updated_at before update on public.report_requests for each row execute function public.set_updated_at();
create trigger trg_student_reports_updated_at before update on public.student_reports for each row execute function public.set_updated_at();
create trigger trg_messages_updated_at before update on public.messages for each row execute function public.set_updated_at();
create trigger trg_notifications_updated_at before update on public.notifications for each row execute function public.set_updated_at();
create trigger trg_calendar_events_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();
create trigger trg_settings_updated_at before update on public.settings for each row execute function public.set_updated_at();
