import{collectionHandlers}from'@/server/resources';import{guardians}from'@/server/payloads';const h=collectionHandlers(guardians,true);export const GET=h.GET;export const POST=h.POST;

export const dynamic='force-dynamic';
