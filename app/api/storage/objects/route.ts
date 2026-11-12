import{requireAdmin,requireRole}from'@/server/auth';import{jsonBody,noContent,ok,route}from'@/server/http';import{deleteObject,listLibrary,privateBuckets}from'@/server/storage';
// Lists files uploaded through the Files page (the library/ folder of each bucket).
export const GET=route(async r=>{const c=await requireAdmin(r);const bucket=r.nextUrl.searchParams.get('bucket');const buckets=bucket?[bucket]:[...privateBuckets];const lists=await Promise.all(buckets.map(b=>listLibrary(c.supabase,b)));return ok(lists.flat())});
export const DELETE=route(async r=>{const c=await requireRole(r,['admin','teacher']),b=await jsonBody(r);await deleteObject(c.supabase,b.bucket,b.path);return noContent()});

export const dynamic='force-dynamic';
