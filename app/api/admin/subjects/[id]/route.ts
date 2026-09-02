import{itemHandlers}from'@/server/resources';import{subjects}from'@/server/payloads';const h=itemHandlers(subjects,true);export const PATCH=h.PATCH;export const DELETE=h.DELETE;
