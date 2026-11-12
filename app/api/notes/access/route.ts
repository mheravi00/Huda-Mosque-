import { requireRole } from '@/server/auth';
import { ok, route } from '@/server/http';

// Admins and teachers (with a linked teacher record) may post notes.
export const GET = route(async request => {
  const c = await requireRole(request, ['admin', 'teacher']);
  if (c.profile.role === 'admin') return ok({ can_post: true });
  const { data } = await c.supabase.from('teachers').select('id').eq('profile_id', c.profile.id).maybeSingle();
  return ok({ can_post: !!data });
});

export const dynamic = 'force-dynamic';
