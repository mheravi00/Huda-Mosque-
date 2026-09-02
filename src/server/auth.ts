import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { ApiError } from './http';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const secret = process.env.SUPABASE_SECRET_KEY || '';
const authOptions = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

export type Profile = { id:string; auth_user_id:string; role:'admin'|'teacher'; active:boolean; first_name:string; last_name:string; email:string };
export type AuthContext = { token:string; user:User; profile:Profile; supabase:SupabaseClient };

export function createSupabaseAdminClient() { if(!url||!secret)throw new Error('Missing Supabase server configuration.');return createClient(url,secret,authOptions); }
export function createSupabaseUserClient(accessToken:string) { if(!url||!publishableKey)throw new Error('Missing Supabase server configuration.');return createClient(url,publishableKey,{...authOptions,global:{headers:{Authorization:`Bearer ${accessToken}`}}}); }
export function bearerToken(request:NextRequest){const header=request.headers.get('authorization')||'';return header.startsWith('Bearer ')?header.slice(7).trim():'';}
export async function requireUser(request:NextRequest):Promise<AuthContext>{
  const token=bearerToken(request);if(!token)throw new ApiError(401,'UNAUTHORIZED','Authentication is required.');
  const supabase=createSupabaseUserClient(token);const {data:{user},error}=await supabase.auth.getUser(token);if(error||!user)throw new ApiError(401,'UNAUTHORIZED','Authentication is invalid or expired.');
  const {data:profile,error:profileError}=await supabase.from('profiles').select('id, auth_user_id, role, active, first_name, last_name, email').eq('auth_user_id',user.id).maybeSingle();
  if(profileError||!profile||!profile.active)throw new ApiError(403,'FORBIDDEN','Access is not permitted.');return{token,user,profile:profile as Profile,supabase};
}
export async function requireAdmin(request:NextRequest){const c=await requireUser(request);if(c.profile.role!=='admin')throw new ApiError(403,'FORBIDDEN','Administrator access is required.');return c;}
export async function requireTeacher(request:NextRequest){const c=await requireUser(request);if(c.profile.role!=='teacher')throw new ApiError(403,'FORBIDDEN','Teacher access is required.');return c;}
export async function requireRole(request:NextRequest,roles:Array<'admin'|'teacher'>){const c=await requireUser(request);if(!roles.includes(c.profile.role))throw new ApiError(403,'FORBIDDEN','Access is not permitted.');return c;}
