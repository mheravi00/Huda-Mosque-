import{requireRole}from'@/server/auth';import{many}from'@/server/resource-utils';import{ok,route}from'@/server/http';import{ensureNumber,ensureUuid}from'@/server/validators';
export const GET=route(async request=>{const c=await requireRole(request,['admin','teacher']);const classId=request.nextUrl.searchParams.get('class_id');const minStreakParam=request.nextUrl.searchParams.get('min_streak');const minStreak=minStreakParam?ensureNumber(Number(minStreakParam),'min_streak',0):1;let q:any=c.supabase.from('v_attendance_absence_streaks').select('*').gte('current_absent_streak',minStreak);if(classId){ensureUuid(classId,'class_id');q=q.eq('class_id',classId)}const r=await many(q.order('current_absent_streak',{ascending:false}));return ok(r.data)});

export const dynamic='force-dynamic';
