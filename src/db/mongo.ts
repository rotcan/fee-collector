import mongoose from "mongoose";
import { Config,Logger } from "../config";
import { EventModel } from "../models/event";
import { EventIndexerModel } from "../models/eventIndexer";
import { MongoBulkWriteError } from "mongodb";
import type { IDatabase } from ".";
import type { EventData, ParsedFeeCollectedEvents } from "../web3";
import type { IntegratorRequestDto, IntegratorResponseDto } from "../dto";

/**
 * Concrete implementation of IDatabase interface for mongodb 
 */
export class MongoDatabase implements IDatabase{
    constructor(){

    }
   
    async dbConnection({ uri }: { uri: string; }):Promise<void>{
        try {
            await mongoose.connect(uri);
          } catch (error) {
            Logger.error(error,"Error in DbConnect");
          }
    };

    async dbDisconnect(): Promise<void> {
        try {
            await mongoose.disconnect()
          } catch (error) {
              Logger.error(error,"Error in DbDisconnect");
          }
    }

    async saveEvents({ events }: { events: EventData[]; }): Promise<boolean> {
        try{
            if(events.length>0){
                await EventModel(Config.chainId!).insertMany(events);
            }
            return true;
        }catch(error){
            if(error instanceof MongoBulkWriteError){
                if(error.message.indexOf("duplicate key error")>-1){
                    //Try update
                    Logger.warn({error,blocks:events.map(m=>m.transactionHash)},"Error in inserting saveEvents");
                    for(const eventData of events){
                        try{
                            await EventModel(Config.chainId!).updateOne({
                                contractAddress: eventData.contractAddress,
                                transactionHash: eventData.transactionHash,
                            },{
                                eventData,
                            },{
                                upsert: true,
                            });
                        }catch(error){
                            Logger.error({error,eventData},"Error in updating event");
                        }
                    }
                    return true;
                }else{
                    Logger.error(error,"Error in saveEvents");
                }
            }
            
        }
        return false;
    }
    
    async getEvents({ integrator, pageNumber, pageSize, chainId, contractAddress }: IntegratorRequestDto): Promise<IntegratorResponseDto | undefined> {
        try{
            const id= chainId ?? Config.chainId!;
            const address= contractAddress ?? Config.contractAddress;
            const pageStart = Math.max(0,(pageNumber!-1) * pageSize!);
            const count = await EventModel(id).find({
                contractAddress: address,
                integrator: integrator
            }).countDocuments();
            const data: ParsedFeeCollectedEvents[]  = await EventModel(id).find({
                contractAddress: address,
                integrator: integrator
            },{
              "integrator": 1,
              "lifiFee": 1,
              "integratorFee": 1,
              "token": 1,  
              "_id":0,
            },{limit: pageSize,skip:pageStart });
            return {
                events: data,
                pageCount: pageNumber!,
                pageSize: pageSize!,
                totalRecords: count
            };
        }catch(error){
            Logger.error(error,"Error in getEvents");
        }
    }
   async  updateEventsIndexer({ chainId, contractAddress, toBlock }: { chainId: number; contractAddress: string; toBlock: number; }): Promise<boolean> {
    //Update lastIndexedRecord to database
    try{
        await EventIndexerModel.findOneAndUpdate(
            {chainId,contractAddress},
            {chainId,contractAddress,lastBlockId: toBlock},
            {upsert: true})
        return true;
    }catch(error){
        Logger.error(error,"Error in saveEvents");
    }
    return false;
    }
}
