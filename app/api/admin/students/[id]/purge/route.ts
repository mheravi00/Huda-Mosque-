import{requireAdmin}from'@/server/auth';import{ApiError,noContent,route}from'@/server/http';import{mapDatabaseError}from'@/server/resource-utils';import{ensureUuid}from'@/server/validators';
// Permanent delete from the recycling bin. Only archived students can be purged.
export const DELETE=route(async(r,_:{params:{id:string}})=>{ensureUuid(_.params.id);const c=await requireAdmin(r);const{data:s,error:e1}=await c.supabase.from('students').select('id,status').eq('id',_.params.id).maybeSingle();mapDatabaseError(e1);if(!s)throw new ApiError(404,'NOT_FOUND','The student was not found.');if(s.status!=='archived')throw new ApiError(409,'CONFLICT','Only archived students can be permanently deleted. Remove from enrolment first.');const{data,error}=await c.supabase.from('students').delete().eq('id',_.params.id).select();mapDatabaseError(error);if(!data?.length)throw new ApiError(404,'NOT_FOUND','The student was not found.');return noContent()});

export const dynamic='force-dynamic';
