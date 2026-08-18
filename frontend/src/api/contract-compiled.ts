/**
 * contract-compiled.ts
 *
 * TypeScript types & contract definition for the counter.compact contract:
 *
 *   pragma language_version >= 0.23;
 *   export ledger yes_count: Uint<64>;
 *   export ledger no_count: Uint<64>;
 *   export ledger total_votes: Uint<64>;
 *   witness get_vote(): Boolean;
 *   export circuit cast_vote(): [];
 *   constructor();
 */

export interface ContractLedgerState {
  yes_count: bigint;
  no_count: bigint;
  total_votes: bigint;
}

export interface ContractWitnesses<T = any> {
  get_vote: (context: T) => [T, boolean] | boolean;
}

export interface ContractCircuits<T = any> {
  cast_vote: (context: T) => [T, void] | void;
}

export class CounterContract<T = any> {
  readonly witnesses: ContractWitnesses<T>;
  readonly circuits: ContractCircuits<T>;

  constructor(witnesses: ContractWitnesses<T>) {
    this.witnesses = witnesses;
    this.circuits = {
      cast_vote: (context: T) => {
        const witnessResult = this.witnesses.get_vote(context);
        const vote = Array.isArray(witnessResult) ? witnessResult[1] : witnessResult;
        return [context, undefined] as any;
      },
    };
  }

  initialState(): ContractLedgerState {
    return {
      yes_count: 0n,
      no_count: 0n,
      total_votes: 0n,
    };
  }
}

export const compiledCounterContract = {
  contractName: "counter",
  source: "counter.compact",
  version: "0.23.0",
  circuits: ["cast_vote"],
  witnesses: ["get_vote"],
  initialState: {
    yes_count: 0n,
    no_count: 0n,
    total_votes: 0n,
  },
  Contract: CounterContract,
};
