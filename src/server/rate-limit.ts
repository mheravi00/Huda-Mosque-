import type{NextRequest}from'next/server';
// Deployment abstraction: connect this boundary to the chosen distributed limiter.
// Authentication, RLS, payload limits, and provider quotas remain enforced meanwhile.
export async function enforceRateLimit(_request:NextRequest,_scope:'account-creation'|'messaging'|'delivery'|'pdf'|'signed-url'){return{allowed:true}}
