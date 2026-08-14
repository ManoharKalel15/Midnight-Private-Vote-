/**
 * midnight.ts — Wallet connect/disconnect + Midnight provider setup
 *
 * The DApp Connector API is injected by the Lace wallet into:
 *   window.midnight.mnLace
 *
 * Connection flow:
 *   1. detectWallet()      — check if Lace extension is present
 *   2. connectWallet()     — call .enable() then .connect('preprod')
 *   3. buildProviders()    — assemble all Midnight.js providers
 *   4. disconnectWallet()  — call .disconnect()
 */

// Midnight DApp Connector API type (injected by Lace extension)
export interface MidnightConnectorAPI {
  apiVersion: string;
  name: string;
  enable: () => Promise<EnabledAPI>;
  isEnabled: () => Promise<boolean>;
}

export interface EnabledAPI {
  connect: (networkId: string) => Promise<ConnectedAPI>;
  disconnect: () => Promise<void>;
}

export interface ConnectedAPI {
  getShieldedAddress: () => Promise<string>;
  balances: () => Promise<WalletBalances>;
  state: () => Promise<WalletState>;
}

export interface WalletBalances {
  night?: bigint;
  dust?: bigint;
}

export interface WalletState {
  networkId: string;
  address: string;
}

// Midnight environment configuration (from .env)
export const MIDNIGHT_CONFIG = {
  networkId: (import.meta.env.VITE_NETWORK_ID as string) || "preprod",
  indexerUri:
    (import.meta.env.VITE_INDEXER_URL as string) ||
    "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWsUri:
    (import.meta.env.VITE_INDEXER_WS_URL as string) ||
    "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  proofServerUri:
    (import.meta.env.VITE_PROOF_SERVER_URL as string) ||
    "https://proof-server.testnet-02.midnight.network",
  contractAddress: (import.meta.env.VITE_CONTRACT_ADDRESS as string) || "",
} as const;

// Detect Lace wallet
export function detectWallet(): MidnightConnectorAPI | null {
  try {
    const w = window as unknown as {
      midnight?: { mnLace?: MidnightConnectorAPI };
    };
    return w.midnight?.mnLace ?? null;
  } catch {
    return null;
  }
}

// Connection result
export interface WalletConnection {
  api: ConnectedAPI;
  address: string;
  networkId: string;
}

// Connect to Lace wallet on Preprod
export async function connectWallet(): Promise<WalletConnection> {
  const connector = detectWallet();
  if (!connector) {
    throw new Error(
      "Lace wallet not detected. Please install the Lace browser extension with Midnight support."
    );
  }

  // Enable the connector (triggers wallet permission popup)
  const enabledApi = await connector.enable();

  // Connect to the configured network (preprod)
  const connectedApi = await enabledApi.connect(MIDNIGHT_CONFIG.networkId);

  // Retrieve the shielded address
  const address = await connectedApi.getShieldedAddress();

  return {
    api: connectedApi,
    address,
    networkId: MIDNIGHT_CONFIG.networkId,
  };
}

// Disconnect wallet
export async function disconnectWallet(enabledApi: EnabledAPI): Promise<void> {
  await enabledApi.disconnect();
}

// Format a long shielded address for display
export function formatAddress(address: string): string {
  if (!address || address.length < 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}