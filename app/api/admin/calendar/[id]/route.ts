import{itemHandlers}from'@/server/resources';import{calendar}from'@/server/payloads';const h=itemHandlers(calendar,true);export const PATCH=h.PATCH;export const DELETE=h.DELETE;
