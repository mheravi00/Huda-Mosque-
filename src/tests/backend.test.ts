mmmmmimport test from 'node:test';
import assert from 'node:assert/strict';

import { isUuid, isValidDate, normalizeRole, requiredText } from '../lib/validation';
import { assertAllowedTeacherAccess, assertAuthorizedRole } from '../lib/security';

test('UUID validation accepts a valid UUID', () => {
  assert.equal(isUuid('550e8400-e29b-41d4-a716-446655440001'), true);
});

test('UUID validation rejects malformed value', () => {
  assert.equal(isUuid('not-a-uuid'), false);
});

test('Date validation accepts valid dates', () => {
  assert.equal(isValidDate('2026-09-02'), true);
});

test('Required text throws for empty strings', () => {
  assert.throws(() => requiredText('', 'Name'));
});

test('Role validation accepts admin and teacher', () => {
  assert.equal(normalizeRole('admin'), 'admin');
  assert.equal(normalizeRole('teacher'), 'teacher');
});

test('Authorization helper rejects invalid role', () => {
  assert.throws(() => assertAuthorizedRole('parent'));
});

test('Teacher-only authorization accepts teacher role', () => {
  assert.doesNotThrow(() => assertAllowedTeacherAccess('teacher'));
});

test('Teacher-only authorization rejects non-teacher role', () => {
  assert.throws(() => assertAllowedTeacherAccess('admin'));
});
