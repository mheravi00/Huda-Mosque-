import { NextRequest } from 'next/server';
import { createSupabaseUserClient } from '../../../../src/server/auth';
import { listStudentsForAdmin } from '../../../../src/server/repositories';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseUserClient(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, active')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin' || !profile.active) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const students = await listStudentsForAdmin();
    return Response.json({ data: students, count: students.length });
  } catch (error) {
    console.error('Admin student lookup failed:', error instanceof Error ? error.message : 'unknown error');
    return Response.json({ error: 'Unable to retrieve students.' }, { status: 500 });
  }
}
