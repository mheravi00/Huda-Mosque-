export function ensureUuid(value: unknown, fieldName = 'id'): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`${fieldName} must be a valid UUID.`);
  }

  return value;
}

export function requiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

export function ensureDate(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return value;
}

export function ensureRole(value: unknown): 'admin' | 'teacher' {
  const role = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (role === 'admin' || role === 'teacher') {
    return role;
  }

  throw new Error('Role must be admin or teacher.');
}

export function ensureNotificationType(value: unknown): string {
  const type = typeof value === 'string' ? value.trim().toLowerCase() : '';
  const allowed = ['info', 'success', 'warning', 'error', 'report', 'attendance', 'message'];

  if (allowed.includes(type)) {
    return type;
  }

  throw new Error('Notification type is invalid.');
}

export function ensureReportStatus(value: unknown): string {
  const status = typeof value === 'string' ? value.trim() : '';
  const allowed = ['Draft', 'Submitted', 'Under Review', 'Changes Requested', 'Approved', 'Sent'];

  if (allowed.includes(status)) {
    return status;
  }

  throw new Error('Report status is invalid.');
}
