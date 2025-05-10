Initialize application

```
npm i
```

Run application 

```
npm run start
```

Run tests

```
npm test
```

Run dockerized application 
Note : Need environment file to create docker container. We can copy sample.env files to .env to have a default environment file.

```
docker-compose up
```

Rebuild & Run dockerized application 

```
docker-compose up --build
```

### APIs
If .env is kept same, then server should run at 3000 port. User below rest API to get events for particular integrator

```
http://127.0.0.1:3000/events/0xaA86522Fd61537c0fBD125f5a4e16cba3e24729f
```

### About

This tool is used to index fee collected events generated from evm based contracts. It is designed in such a way that we can plug different chains and database to store events by writing concrete classes respectively. It stores events in separate table per chain assuming that a single chain can have lot of events and we do not require consolidated reporting of diffreent 

### Modules:

+ Models:
    * events.ts : Model class to store parsed fee events generated from contract
    * eventindexer.ts : Model class to store last processed block by evm chain. Records from this model is used to resume indexing

+ Db:
    * index.ts : Has IDBInterface interface which abstracts database operations
    * mongo.ts : Concrete implementation of IDBInterface implementing MongoDB operations

+ Web3:
    * index.ts : Has IFeeCollector inferface which abstracts Fee collector methods
    * evm.ts : Concrete implementation of IFeeCollector interface, has Polygon related methods. Though it should work for other EVM chains if event structure is same 

+ config.ts : This stores global configuration for the tool. Also instantiates logger object

+ dto.ts : This code contains request and response type for REST apis

+ factory.ts : This has factory methods with conrete implementations of IDBInterface & IFeeCollector interface based on environment variables

+ helper.ts : This code contains helper function to convert environment string field to boolean

+ main.ts : This is the starting point of the application. It calls method to initalize and run fastify server

+ server.ts : This contains code for fastify server initialization, cron and routes setup. This exposes REST API which returns event details for specific integrator

+ service.ts : This code glues together different parts of the tool. It calls web3 methods to fetch and parse events and then calls db methods to update records in database.

### Functionalities:
+ Implemented
    - [x] Integrator API : Added pagination so that server does not respond a large number of records in one go. Always good to have pagination in get calls which return array of records.
    - [x] Dockerfile : Dockerised service and mongodb in containers
    - [x] Added health check API which can be used containerized solutions (e.g. kubernetes) to restart service if service stops responding.
    - [x] Added interfaces for db & fee collector to decouple concrete implementations
    - [x] Added exponential backoff to cron jobs for rpc failues (rate limit etc)
    - [x] Added few integration tests
    - [x] Added option to pause/resume indexing
    - [x] Added option to upsert records if same blocks need to be processed again
    - [x] Control logging levels from env variables
    - [x] Added index for faster retrieval for integrator and unique index so same transactionHash is not processed twice
    - [x] Support multiple chains using same code by passing separate environment variables. Service can be containerized and run parallelly using different rpc urls as we create one events table per chain 

+ Improvements
    - [ ] Implement PM2 so service restarts on failures
    - [ ] Better error handling
    - [ ] Refactor modules to improve readability and have proper division of code.
    - [ ] Better congifuration handling
    - [ ] Add more comprehensive test cases

