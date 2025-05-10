import type { IntegratorRequestDto, IntegratorResponseDto } from "../dto";
import type { EventData } from "../web3";

//Database interface to support event insertion
//This can be used to abstract database methods for event insertion
export interface IDatabase{
    /**
     * Initialize db connection
     * @param uri RPC url 
     */
    dbConnection({ uri }: { uri: string }):Promise<void>;

    /**
     * Disconnect from db
     */
    dbDisconnect():Promise<void>;
    
    /**
     * Method to upsert event records in database
     * @param events Events data array to be upserted in database 
     * returns true if save is successful
     */
    saveEvents({events}:{events: EventData[]}):Promise<boolean>;

    /**
     * Fetch paginated event records from database based on below filters 
     * @param integrator Integrator
     * @param pageNumber 
     * @param pageSize
     * @param chainId
     * @param contractAddress
     * returns EventRecords array in format required by API request 
     */
    getEvents({integrator, pageNumber, pageSize,chainId,contractAddress}:IntegratorRequestDto):Promise<IntegratorResponseDto | undefined>

    /**
     * Upserts records to store last successful block processed by service for chainId and contractAddress combination
     * @param chainId Current chain id being indexed
     * @param contractAddress Events being stored for specific contract address
     * @param toBlock Last block processed by service
     * returns True if record is upserted successfully
     */
    updateEventsIndexer({chainId,contractAddress,toBlock}:{chainId: number, contractAddress: string,toBlock: number}):Promise<boolean>
}

