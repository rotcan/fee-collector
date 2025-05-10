
import { describe, expect, test } from '@jest/globals';
import request from "supertest";
import { Config, Logger } from '../src/config';
import { closeServer, db,  startServer } from '../src/server';



describe("Events",()=>{

    let server;
    let feeCollector;

    beforeAll(async () => {
        Config.pauseIndexing=true;
        
        //Todo: This is ugly that logging levels have to set twice
        Config.loggingLevel="error";
        Logger.level= Config.loggingLevel;

        let response = await startServer();
        server=response.fastify;
        feeCollector= response.feeCollector;
      });
  
    //Verify the event generated in a specific block
    //Same block should generate the same event for specific rpc
    test('Events in block range',async()=>{
        const onChainEvents = await feeCollector.loadFeeCollectorEvents({fromBlock: 61500000,toBlock:61500054});
        //Verify events count in specified range
        expect(onChainEvents).toHaveLength(1);
        
        const parsedEvents = feeCollector.parseFeeCollectorEvents({events: onChainEvents});
        expect(parsedEvents).toHaveLength(1);
        
        const firstEvent=parsedEvents[0];
        //Verify event data
        expect(firstEvent.token).toBe("0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
        expect(firstEvent.integrator).toBe("0xaA86522Fd61537c0fBD125f5a4e16cba3e24729f");
        expect(firstEvent.integratorFee.toBigInt()).toBe(56000n);
        expect(firstEvent.lifiFee.toBigInt()).toBe(14000n);
        
    });

    //To verify data is inserted in database
    //As data insertion supports upsert, 
    test('Test data insertion',async()=>{
        const onChainEvents = await feeCollector.loadFeeCollectorEvents({fromBlock: 61500000,toBlock:61500054});
        const parsedEvents = feeCollector.parseFeeCollectorEvents({events: onChainEvents});
        expect(await db.saveEvents({events: parsedEvents})).toBe(true);
    });

    //To verify api response for specific integrator inserted in above test.
    //It should return events > 0 
    //Events returned should have integrator other than the value passed in api request parameter
    test('Test Api',async()=>{
        const integrator="0xaA86522Fd61537c0fBD125f5a4e16cba3e24729f";
        const url=`/events/${integrator}`;
        const response = await request(server.server).get(url);
        expect(response.status).toBe(200);
        expect(response.body.filter((m:any)=>m.integrator!=integrator).length).toBe(0);
        expect(response.body.filter((m:any)=>m.integrator==integrator).length).toBeGreaterThan(0);
    });

    afterAll(async () => {
        // await connection.close();
        closeServer(server);
    });
})
