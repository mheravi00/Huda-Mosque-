import{itemHandlers}from'@/server/resources';import{homework}from'@/server/payloads';const h=itemHandlers(homework);export const GET=h.GET;export const PATCH=h.PATCH;export const DELETE=h.DELETE;
