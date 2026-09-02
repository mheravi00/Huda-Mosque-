import{collectionHandlers}from'@/server/resources';import{reports}from'@/server/payloads';const h=collectionHandlers(reports);export const GET=h.GET;export const POST=h.POST;
export const dynamic='force-dynamic';
