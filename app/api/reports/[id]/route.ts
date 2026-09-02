import{itemHandlers}from'@/server/resources';import{reports}from'@/server/payloads';const h=itemHandlers(reports);export const GET=h.GET;export const PATCH=h.PATCH;
