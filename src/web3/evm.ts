import { BigNumber, ethers } from "ethers"; // please use ethers v5 to ensure compatibility
import { FeeCollector__factory } from "lifi-contract-typings";
import type { BlockId, CollectorEvents, EventData, IFeeCollector } from ".";
import { Config } from "../config";

export class PolygonFeeCollector implements IFeeCollector {
  constructor() {}

  /**
   * For a given block range all `FeesCollected` events are loaded from the Polygon FeeCollector
   * @param fromBlock
   * @param toBlock
   */
  loadFeeCollectorEvents = ({
    fromBlock,
    toBlock,
  }: {
    fromBlock: BlockId;
    toBlock: BlockId;
  }): Promise<CollectorEvents[]> => {
    const feeCollector = new ethers.Contract(
      Config.contractAddress,
      FeeCollector__factory.createInterface(),
      new ethers.providers.JsonRpcProvider(Config.rpc)
    );
    const filter = feeCollector.filters.FeesCollected();
    return feeCollector.queryFilter(filter, fromBlock, toBlock);
  };

  /**
   * Takes a list of raw events and parses them into ParsedFeeCollectedEvents
   * @param events
   */
  parseFeeCollectorEvents = ({
    events,
  }: {
    events: CollectorEvents[];
  }): EventData[] => {
    const feeCollectorContract = new ethers.Contract(
      Config.contractAddress,
      FeeCollector__factory.createInterface(),
      new ethers.providers.JsonRpcProvider(Config.rpc)
    );

    return events.map((event) => {
      const parsedEvent = feeCollectorContract.interface.parseLog(event);

      const feesCollected: EventData = {
        token: parsedEvent.args[0],
        integrator: parsedEvent.args[1],
        integratorFee: BigNumber.from(parsedEvent.args[2]),
        lifiFee: BigNumber.from(parsedEvent.args[3]),
        transactionHash: event.transactionHash,
        contractAddress: Config.contractAddress,
      };
      return feesCollected;
    });
  };
}
