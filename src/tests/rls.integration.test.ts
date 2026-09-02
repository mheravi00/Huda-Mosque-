import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const integrationEnabled = process.env.SUPABASE_RLS_TESTS === 'true';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

function requireIntegrationConfig() {
  if (!url || !publishableKey) {
    throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to run RLS integration tests.');
  }

  const hostname = new URL(url).hostname;
  if (hostname === 'your-project-ref.supabase.co' || hostname.includes('placeholder')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must point to the real Supabase project, not a placeholder hostname.');
  }
}

test('unauthenticated users cannot read students', { skip: !integrationEnabled }, async () => {
  requireIntegrationConfig();
  const client = createClient(url, publishableKey, { auth: { persistSession: false } });
  const { data, error } = await client.from('students').select('id').limit(1);
  assert.ifError(error);
  assert.deepEqual(data, []);
});

test('RLS integration suite requires explicit live Supabase configuration', { skip: integrationEnabled }, () => {
  assert.equal(integrationEnabled, false);
});

// The remaining admin, assigned-teacher, isolated-teacher, guardian, and storage
// scenarios should run with disposable Supabase Auth users created by CI.
// They are intentionally not faked here: unit tests must never be labelled RLS tests.
