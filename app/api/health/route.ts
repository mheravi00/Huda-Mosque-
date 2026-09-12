export async function GET() {
  return Response.json({
    ok: true,
    service: 'madrasa-backend',
    environment: process.env.NODE_ENV || 'development',
    configured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_SECRET_KEY
    ),
  }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
}

export const dynamic='force-dynamic';
