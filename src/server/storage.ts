import { createSupabaseAdminClient } from './auth';

export async function createSignedUrl(bucket: string, path: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
