import type{NextRequest}from'next/server';import{requireAdmin}from'@/server/auth';import{ok,route}from'@/server/http';import{mapDatabaseError}from'@/server/resource-utils';
export const GET=route(async(r:NextRequest)=>{const c=await requireAdmin(r);const{data,error}=await c.supabase.from('teachers').select('*, profiles!inner(id,username,first_name,last_name,email,phone,approval_status,created_at)').eq('profiles.approval_status','pending').order('created_at',{ascending:true});mapDatabaseError(error);return ok(data??[])});

export const dynamic='force-dynamic';
