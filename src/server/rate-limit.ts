import type{NextRequest}from'next/server';
export async function enforceRateLimit(_request:NextRequest,_scope:'account-creation'|'messaging'|'delivery'|'pdf'|'signed-url'){return{allowed:true}}
