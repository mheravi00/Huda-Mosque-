import{collectionHandlers}from'@/server/resources';import{subjects}from'@/server/payloads';const h=collectionHandlers(subjects,true);export const GET=h.GET;export const POST=h.POST;

export const dynamic='force-dynamic';
