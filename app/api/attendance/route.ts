import{collectionHandlers}from'@/server/resources';import{attendance}from'@/server/payloads';const h=collectionHandlers(attendance);export const GET=h.GET;export const POST=h.POST;
export const dynamic='force-dynamic';
