import cors from "@fastify/cors";
import { CronJob } from "cron";
import Fastify, {
    type FastifyInstance,
    type FastifyReply,
    type FastifyRequest,
} from "fastify";
import { Config,Logger } from "./config";
import { type IDatabase } from "./db";
import type { IntegratorRequestDto } from "./dto";
import { getIDatabase, getIFeeCollector } from "./factory";
import { getEventsByIntegrator, processAndSaveEvents } from "./service";
import { fetchChainId, type IFeeCollector } from "./web3";


//Global variable to check if previous job is running or not. At one time we have only one job running
var isJobRunning = false;

//Instiate db instance with concrete class. In this case we are using MongoDb
export const db: IDatabase = getIDatabase(Config.database);



/**
 * Method to run service method at specific interval with exponential backoff added for failures
 * @param callback Method to be called every x seconds in cron job
 * @param maxRetries Max retries to handle failures
 * @param initialDelayMs
 * @returns
 */
const withExponentialBackoff = async({
    callback,
    initialDelayMs = 1000,
    maxRetries = 10,
  }: {
    callback(): Promise<void>;
    maxRetries?: number;
    initialDelayMs?: number;
  }): Promise<void> => {
    let retries = 0;
    let delayMs = initialDelayMs;
  
    while (retries < maxRetries) {
      try {
        return await callback();
  
      } catch (error) {
          Logger.warn(error)
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }
    }
    throw new Error("Operation failed after maximum retries");
  };

  
/**
 * Main method to instantiate server, initialize database connection and cron based on global environment variables
 * @returns
 */
export const startServer = async () => {
  const fastify = Fastify({
    logger: { level: Config.loggingLevel },
  });

  //Instantiate fee collector instance with concrete class. In current case its polygon
  const feeCollector: IFeeCollector = getIFeeCollector(
    Config.chainId ?? (await fetchChainId({ rpc: Config.rpc }))
  );

  try {
    //For health check purposes
    fastify.get("/", async (_request, reply) => {
      reply
        .code(200)
        .header("Content-Type", "application/json; charset=utf-8")
        .send({});
    });

    fastify.get(
      "/events/:integrator",
      async (
        request: FastifyRequest<{
          Params: Pick<IntegratorRequestDto, "integrator">;
          Querystring: Omit<IntegratorRequestDto, "integrator">;
        }>,
        reply: FastifyReply
      ) => {
        const params = {
          ...request.params,
          ...request.query,
        };
        reply
          .code(200)
          .header("Content-Type", "application/json; charset=utf-8")
          .send(await getEventsByIntegrator({ requestDto: params, db }));
      }
    );

    //For production usage, need to make it more flexible.
    await fastify.register(cors, {
      origin: Config.corsOrigin,
    });

    //connect to mongo database
    await db.dbConnection({ uri: Config.dbUri });

    //update chain Id to configuration
    Config.chainId = await fetchChainId({ rpc: Config.rpc });

    //If indexing is not paused, then create a job to fetch records from rpc and index them in database
    if (!Config.pauseIndexing) {
      const _ = CronJob.from({
        cronTime: "* * * * * *",
        onTick: async function () {
          if (!isJobRunning) {
            isJobRunning = true;
            await withExponentialBackoff({
              callback: async () => {
                await processAndSaveEvents({ db, feeCollector });
              },
            });
            isJobRunning = false;
          }
        },
        start: true,
      });
    }

    //run http server
    await fastify.listen({ port: Config.port, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    closeServer(fastify);

    process.exit(1);
  }
  return { fastify, feeCollector };
};

export const closeServer = async (fastify: FastifyInstance) => {
  try {
    fastify.close();
  } catch (err) {
  } finally {
    db.dbDisconnect();
  }
};
