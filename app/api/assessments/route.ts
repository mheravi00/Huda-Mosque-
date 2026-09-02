import{collectionHandlers}from'@/server/resources';import{assessments}from'@/server/payloads';const h=collectionHandlers(assessments);export const GET=h.GET;export const POST=h.POST;
export const dynamic='force-dynamic';
