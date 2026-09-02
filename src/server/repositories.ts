import { createSupabaseAdminClient, createSupabaseUserClient } from './auth';
import { ensureDate, ensureRole, ensureUuid, requiredString } from './validators';

export async function getProfileByAuthUserId(authUserId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('auth_user_id', authUserId).single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listStudentsForAdmin() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('students').select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listClassesForTeacher(accessToken: string) {
  const supabase = createSupabaseUserClient(accessToken);
  const { data, error } = await supabase
    .from('class_teachers')
    .select('class_id, classes ( * )');

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createStudentReport(input: {
  student_id: string;
  teacher_id: string;
  class_id?: string;
  subject_id?: string;
  report_period: string;
  status?: string;
  grade?: string;
  score?: number;
  teacher_comments?: string;
}) {
  ensureUuid(input.student_id, 'student_id');
  ensureUuid(input.teacher_id, 'teacher_id');
  if (input.class_id) ensureUuid(input.class_id, 'class_id');
  if (input.subject_id) ensureUuid(input.subject_id, 'subject_id');
  requiredString(input.report_period, 'report_period');

  const supabase = createSupabaseAdminClient();
  const payload = {
    student_id: input.student_id,
    teacher_id: input.teacher_id,
    class_id: input.class_id || null,
    subject_id: input.subject_id || null,
    report_period: input.report_period,
    status: input.status || 'Draft',
    grade: input.grade || null,
    score: input.score ?? null,
    teacher_comments: input.teacher_comments || null,
  };

  const { data, error } = await supabase.from('student_reports').insert(payload).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createAttendanceRecord(input: {
  class_id: string;
  student_id: string;
  attendance_date: string;
  status: string;
  notes?: string;
}) {
  ensureUuid(input.class_id, 'class_id');
  ensureUuid(input.student_id, 'student_id');
  ensureDate(input.attendance_date, 'attendance_date');
  const allowed = ['Present', 'Absent', 'Late', 'Excused'];

  if (!allowed.includes(input.status)) {
    throw new Error('Attendance status is invalid.');
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('attendance').insert({
    class_id: input.class_id,
    student_id: input.student_id,
    attendance_date: input.attendance_date,
    status: input.status,
    notes: input.notes || null,
  }).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createNotification(input: {
  user_id: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  ensureUuid(input.user_id, 'user_id');
  requiredString(input.title, 'title');
  requiredString(input.message, 'message');
  ensureRole(input.type || 'info');

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('notifications').insert({
    user_id: input.user_id,
    title: input.title,
    message: input.message,
    type: input.type || 'info',
    link: input.link || null,
  }).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
