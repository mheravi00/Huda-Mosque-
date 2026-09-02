import { ApiError,mapDatabaseError } from './http';
export async function one(query:PromiseLike<{data:any;error:any}>){const{data,error}=await query;mapDatabaseError(error);if(!data)throw new ApiError(404,'NOT_FOUND','The requested record was not found.');return data}
export async function many(query:PromiseLike<{data:any[]|null;error:any;count?:number|null}>){const{data,error,count}=await query;mapDatabaseError(error);return{data:data??[],count:count??data?.length??0}}
export async function mutate(query:PromiseLike<{data:any;error:any}>){const{data,error}=await query;mapDatabaseError(error);return data}
