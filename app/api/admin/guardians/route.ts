import{collectionHandlers}from'@/server/resources';import{guardians}from'@/server/payloads';export const POST=collectionHandlers(guardians,true).POST;
