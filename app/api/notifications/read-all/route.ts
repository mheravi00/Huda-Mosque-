import{requireRole}from'@/server/auth';import{noContent,route}from'@/server/http';import{mapDatabaseError}from'@/server/resource-utils';
// Marks every unread notification for the signed-in user as read (RLS limits rows to their own).
export const POST=route(async r=>{const c=await requireRole(r,['admin','teacher']);const{error}=await c.supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',c.profile.id).is('read_at',null);mapDatabaseError(error);return noContent()});

export const dynamic='force-dynamic';
