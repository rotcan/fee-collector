import type { ParsedFeeCollectedEvents } from "./web3"

/**
 * Request Params for REST endpoint /events/:integrator to get events for specified integrator 
 */
export interface IntegratorRequestDto{
    chainId?: number
    contractAddress? : string,
    integrator: string,
    pageSize?: number,
    pageNumber?: number,
}

/**
 * Response Params for REST endpoint /events/:integrator to get events for specified integrator
 */
export type IntegratorResponseDto = {
    events:ParsedFeeCollectedEvents[]
    pageCount: number, pageSize:number, totalRecords: number
} ;