import { NextRequest } from 'next/server';
import { listStudentsForAdmin } from '../../../server/repositories';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';

  if (!authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const students = await listStudentsForAdmin();
    return Response.json({ data: students, count: students.length });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
