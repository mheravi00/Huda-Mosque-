import{collectionHandlers}from'@/server/resources';import{messageTemplates}from'@/server/payloads';const h=collectionHandlers(messageTemplates,true);export const GET=h.GET;export const POST=h.POST;

export const dynamic='force-dynamic';
