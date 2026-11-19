import{itemHandlers}from'@/server/resources';import{guardians}from'@/server/payloads';import{requireAdmin}from'@/server/auth';import{ApiError,noContent,route}from'@/server/http';import{mapDatabaseError}from'@/server/resource-utils';import{ensureUuid}from'@/server/validators';
export const PATCH=itemHandlers(guardians,true).PATCH;
// Delete a parent/guardian. Pass ?purge_children=true to also archive their children.
export const DELETE=route(async(r,_:{params:{id:string}})=>{ensureUuid(_.params.id);const c=await requireAdmin(r);const purge=r.nextUrl.searchParams.get('purge_children')==='true';
  const{data:links,error:le}=await c.supabase.from('student_guardians').select('student_id').eq('guardian_id',_.params.id);mapDatabaseError(le);const childIds=(links??[]).map((x:any)=>x.student_id);
  if(purge&&childIds.length){const{error}=await c.supabase.from('students').update({status:'archived'}).in('id',childIds);mapDatabaseError(error);}
  else if(childIds.length){
    // Don't orphan a child that would be left with no guardian.
    const{data:others,error:oe}=await c.supabase.from('student_guardians').select('student_id').in('student_id',childIds).neq('guardian_id',_.params.id);mapDatabaseError(oe);
    const stillLinked=new Set((others??[]).map((x:any)=>x.student_id));
    const orphans=childIds.filter((id:string)=>!stillLinked.has(id));
    if(orphans.length)throw new ApiError(409,'HAS_CHILDREN','Reassign or archive this parent\u0027s children before deleting them.');
  }
  const{error}=await c.supabase.from('guardians').delete().eq('id',_.params.id);mapDatabaseError(error);return noContent();});

export const dynamic='force-dynamic';
