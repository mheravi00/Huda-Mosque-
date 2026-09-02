import { createSupabaseAdminClient } from './auth';

export async function getSystemSettings() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('settings').select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createAuditLog(action: string, entity: string, metadata: Record<string, unknown> = {}, userId?: string) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from('audit_logs').insert({
    user_id: userId || null,
    action,
    entity,
    entity_id: metadata.entity_id as string | null,
    metadata,
  });

  if (error) {
    throw new Error(error.message);
  }
}
