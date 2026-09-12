import { requireNoteAuthor } from '@/server/auth';
import { ok, route } from '@/server/http';

export const GET = route(async request => {
  await requireNoteAuthor(request);
  return ok({ can_post: true });
});

export const dynamic='force-dynamic';
