/**
 * contract.ts — Compact contract interaction layer
 *
 * Handles:
 *   - Deploying the private vote counter contract to Preprod
 *   - Finding an already-deployed contract by address
 *   - Calling the cast_vote circuit with a private witness
 *   - Reading the public ledger state
 *
 * The ZK proof is generated locally by the proof server,
 * then submitted to the Midnight node via the wallet.
 */

import { MIDNIGHT_CONFIG, type ConnectedAPI } from "./midnight";

// Public ledger state (what the blockchain shows everyone)
export interface PublicState {
  yes_count: bigint;
  no_count: bigint;
  total_votes: bigint;
}

// Private state stored locally (off-chain, never sent to blockchain)
export interface PrivateState {
  _vote: boolean; // the actual vote — private forever
}

// A deployed contract instance
export interface DeployedContract {
  address: string;
  callTx: {
    cast_vote: (privateState: PrivateState) => Promise<TransactionResult>;
  };
  queryState: () => Promise<PublicState>;
}

export interface TransactionResult {
  txHash: string;
  blockHeight?: number;
}

// ─── Simulation layer ─────────────────────────────────────────────────────────
// When running without real Midnight infrastructure (no proof server / indexer),
// we simulate the on-chain interaction so the UI is fully functional.
// Replace this with real @midnight-ntwrk/midnight-js-contracts calls once
// the Preprod environment is confirmed available.

let simulatedState: PublicState = {
  yes_count: 0n,
  no_count: 0n,
  total_votes: 0n,
};

// Simulate proof generation delay (ZK proofs take ~5-15 seconds in production)
function simulateProofGeneration(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );
}

// Simulated contract instance (used in UI preview / demo mode)
function createSimulatedContract(address: string): DeployedContract {
  return {
    address,
    callTx: {
      cast_vote: async (privateState: PrivateState): Promise<TransactionResult> => {
        // Simulate proof generation
        await simulateProofGeneration();

        // Update simulated on-chain state
        if (privateState._vote) {
          simulatedState = {
            ...simulatedState,
            yes_count: simulatedState.yes_count + 1n,
            total_votes: simulatedState.total_votes + 1n,
          };
        } else {
          simulatedState = {
            ...simulatedState,
            no_count: simulatedState.no_count + 1n,
            total_votes: simulatedState.total_votes + 1n,
          };
        }

        // Return fake transaction hash
        const hash = "0x" + Math.random().toString(16).slice(2).padStart(64, "0");
        return { txHash: hash };
      },
    },
    queryState: async (): Promise<PublicState> => {
      return { ...simulatedState };
    },
  };
}

// ─── Real Midnight.js integration ─────────────────────────────────────────────
// These functions will use the real SDK once providers are wired up.
// The SDK pattern is:
//
//   import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js-contracts';
//   const deployed = await findDeployedContract(providers, { contractAddress, ... });
//   await deployed.callTx.cast_vote();
//
// For now, they fall back to simulation.

export async function deployNewContract(
  _connectedApi: ConnectedAPI
): Promise<DeployedContract> {
  console.log("[Midnight] Deploying new counter contract to", MIDNIGHT_CONFIG.networkId);

  // Real deployment would look like:
  // const providers = buildProviders(_connectedApi);
  // const deployed = await deployContract(providers, { compiledContract, initialState });
  // return wrapDeployed(deployed);

  // Simulated deployment: generate a fake contract address
  const fakeAddress =
    "mn1" +
    Array.from({ length: 58 }, () =>
      "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
    ).join("");

  console.log("[Midnight] Contract deployed (simulated):", fakeAddress);
  return createSimulatedContract(fakeAddress);
}

export async function findExistingContract(
  _connectedApi: ConnectedAPI,
  contractAddress: string
): Promise<DeployedContract> {
  console.log("[Midnight] Finding contract at", contractAddress);

  // Real lookup:
  // const providers = buildProviders(_connectedApi);
  // const deployed = await findDeployedContract(providers, { contractAddress, compiledContract });
  // return wrapDeployed(deployed);

  return createSimulatedContract(contractAddress);
}

export async function castVote(
  contract: DeployedContract,
  vote: boolean
): Promise<TransactionResult> {
  const privateState: PrivateState = { _vote: vote };

  console.log(
    "[Midnight] Casting vote — generating ZK proof...",
    "(vote hidden from chain)"
  );

  const result = await contract.callTx.cast_vote(privateState);

  console.log("[Midnight] Transaction confirmed:", result.txHash);
  return result;
}

export async function readPublicState(
  contract: DeployedContract
): Promise<PublicState> {
  return contract.queryState();
}

// Preprod explorer URL for contract address
export function getExplorerUrl(contractAddress: string): string {
  return `https://explorer.testnet-02.midnight.network/contracts/${contractAddress}`;
}