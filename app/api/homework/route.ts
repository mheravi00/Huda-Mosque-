import{collectionHandlers}from'@/server/resources';import{homework}from'@/server/payloads';const h=collectionHandlers(homework);export const GET=h.GET;export const POST=h.POST;
export const dynamic='force-dynamic';
