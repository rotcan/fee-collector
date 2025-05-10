import * as dotenv from "dotenv";
import { convertToBoolean } from "./helper";
import pino from "pino";
dotenv.config();

export const EVENT_MODEL_TITLE = "event";
export const EVENT_MODEL_INDEXER_TITLE = "eventIndexer";

const LOGGING = convertToBoolean(process.env.LOGGING) || true;
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const DB_URI =
  process.env.DB_URI || "mongodb://127.0.0.1:27017/lifi?maxPoolSize=10";
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9";
const RPC = process.env.RPC || "https://polygon-rpc.com";
const START_BLOCK_ID = process.env.START_BLOCK_ID || "61500000";
const BLOCK_FETCH_LIMIT = process.env.BLOCK_FETCH_LIMIT || "100";
const PAUSE_INDEXING = convertToBoolean(process.env.PAUSE_INDEXING) || false;
const LOGGING_LEVEL = process.env.LOGGING_LEVEL || "info";
const DATABASE = process.env.DATABASE || "mongodb";
/**
 * Configuration interface
 */
interface IConfig {
  chainId?: number;
  logging: boolean;
  port: number;
  corsOrigin: string;
  dbUri: string;
  contractAddress: string;
  rpc: string;
  startBlockId: number;
  blockFetchLimit: number;
  pauseIndexing: boolean;
  defaultPageSize: number;
  defaultPageStart: number;
  loggingLevel: string;
  database: string;
}

/**
 * Init Configuration to cache global environment variables passed to this service
 */
export var Config: IConfig = {
  logging: LOGGING,
  contractAddress: CONTRACT_ADDRESS,
  dbUri: DB_URI,
  rpc: RPC,
  corsOrigin: CORS_ORIGIN,
  port: +PORT,
  startBlockId: +START_BLOCK_ID,
  blockFetchLimit: +BLOCK_FETCH_LIMIT,
  pauseIndexing: PAUSE_INDEXING,
  defaultPageSize: 10,
  defaultPageStart: 1,
  loggingLevel: LOGGING_LEVEL,
  database: DATABASE,
};

//Initialize logger with logging level fetched from configuration
export const Logger = pino({
  level: Config.loggingLevel,
});
