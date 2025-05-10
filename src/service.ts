import { fetchChainId, fetchLatestBlockId, type IFeeCollector,  } from "./web3";
import { Config,Logger } from "./config";
import { EventIndexerModel } from "./models/eventIndexer";
import type { IntegratorRequestDto } from "./dto";
import type { IDatabase } from "./db";
 
/**
 * 
 * @param db: db interface to save events to database 
 */
export const processAndSaveEvents=async({db, feeCollector}:{db: IDatabase, feeCollector: IFeeCollector})=>{
    //Global configuration parameters
    const rpc=Config.rpc
    const contractAddress= Config.contractAddress;
    const startBlockId = Config.startBlockId;
    const blockFetchLimit= Config.blockFetchLimit;
    //Get chain from RPC
    const chainId= Config.chainId ?? await fetchChainId({rpc});
    if(chainId){
        //Get last processed event
        const lastIndexedRecord = await EventIndexerModel.findOne({chainId, contractAddress});

        //Get last indexed record's block Id 
        const lastIndexedRecordBlockId= lastIndexedRecord ? +lastIndexedRecord.lastBlockId : startBlockId;
        
        //Fetch latest on chain block id 
        const latestBlockNumber = await fetchLatestBlockId({rpc});
        const toBlock=Math.min(lastIndexedRecordBlockId + blockFetchLimit,latestBlockNumber);
        
        Logger.trace({lastIndexedRecordBlockId,toBlock},"lastIndexedRecordBlockId");
        await feeCollector.loadFeeCollectorEvents({fromBlock: lastIndexedRecordBlockId, toBlock}).then((events)=>{
            const parsedEvents = feeCollector.parseFeeCollectorEvents({events});
            Logger.trace(parsedEvents,"parsedEvents");
            return parsedEvents
        }).then((parsedEvents)=>{
            //Store events in database
            return db.saveEvents({events: parsedEvents})
        }).then((updated)=>{
            
            if(updated){
                //Update lastIndexedRecord to database
                return db.updateEventsIndexer({chainId,contractAddress,toBlock})
            }else{
                Logger.warn(updated,"Failed to update events table",);
            }
            return false;
        }).then((updated)=>{
            //Log error
            if(!updated){
                Logger.warn(updated,"Failed to update events indexer table",);
            }
        })
    }else{
        Logger.error("Chain Id not set in configuration. Either RPC url is not correct or not an EVM supported chain RPC");
    }

}

/**
 * 
 * @param request Request parameters
 * @param db db interface 
 * @returns ParsedFeeCollectedEvents Array
 */
export const getEventsByIntegrator=async({requestDto,db}:{requestDto: IntegratorRequestDto, db:IDatabase})=>{
    return db.getEvents({...requestDto,
        pageNumber: requestDto.pageNumber ?? Config.defaultPageStart,
        pageSize: requestDto.pageSize ?? Config.defaultPageSize
    });
}