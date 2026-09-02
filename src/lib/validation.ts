export function isUuid(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function requiredText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

export function isValidDate(value: unknown): boolean {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function normalizeRole(value: unknown): 'admin' | 'teacher' {
  const role = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (role === 'admin' || role === 'teacher') {
    return role;
  }

  throw new Error('Invalid role supplied.');
}
