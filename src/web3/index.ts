import type { BlockTag } from "@ethersproject/abstract-provider";
import { BigNumber, ethers } from "ethers"; // please use ethers v5 to ensure compatibility

export type EventData = ParsedFeeCollectedEvents & {
  transactionHash: string;
  contractAddress: string;
};

export interface ParsedFeeCollectedEvents {
  token: string; // the address of the token that was collected
  integrator: string; // the integrator that triggered the fee collection
  integratorFee: BigNumber; // the share collector for the integrator
  lifiFee: BigNumber; // the share collected for lifi
}

export type BlockId = BlockTag | string;
export type CollectorEvents = ethers.Event;

export interface IFeeCollector {
  /**
   * For a given block range all `FeesCollected` events are loaded from the blockchain FeeCollector
   * @param fromBlock
   * @param toBlock
   */
  loadFeeCollectorEvents({
    fromBlock,
    toBlock,
  }: {
    fromBlock: BlockId;
    toBlock: BlockId;
  }): Promise<CollectorEvents[]>;
  /**
   * Takes a list of raw events and parses them into ParsedFeeCollectedEvents
   * @param events
   */
  parseFeeCollectorEvents({
    events,
  }: {
    events: CollectorEvents[];
  }): EventData[];
}

/**
 * Get chain id from a rpc url
 * @param rpc
 */
export const fetchChainId = async ({ rpc }: { rpc: string }) => {
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const { chainId } = await provider.getNetwork();
  return chainId;
};

/**
 * Get Latest block id for a given chain
 * @param rpc
 */
export const fetchLatestBlockId = async ({
  rpc,
}: {
  rpc: string;
}): Promise<number> => {
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const blockId = await provider.getBlockNumber();
  return blockId;
};
