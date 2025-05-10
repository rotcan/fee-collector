import { MongoDatabase } from "./db/mongo";
import { PolygonFeeCollector } from "./web3/evm";

/**
 * Factory method to get database implementation for current environment values
 * @returns IDatabase instance for current database selected
 */
export const getIDatabase=(database: string)=>{
    switch(database){
        case "mongodb": 
        default: 
            return  new MongoDatabase();
    }
}


/**
 * Factory method to get fee collector implementation for current environment values
 * @returns IFeeCollector instance for current database selected
 */
export const getIFeeCollector=(chainId: number)=>{
    switch(chainId){
        case 137: 
        default: 
            return  new PolygonFeeCollector();
    }
}