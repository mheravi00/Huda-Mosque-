import{collectionHandlers}from'@/server/resources';import{messageTemplates}from'@/server/payloads';export const GET=collectionHandlers(messageTemplates).GET;
export const dynamic='force-dynamic';
