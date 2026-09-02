import { normalizeRole } from './validation';

export function assertAuthorizedRole(role: unknown): 'admin' | 'teacher' {
  return normalizeRole(role);
}

export function assertAllowedTeacherAccess(teacherRole: unknown): void {
  const role = assertAuthorizedRole(teacherRole);

  if (role !== 'teacher') {
    throw new Error('Teacher access required.');
  }
}
