/**
 * midnight.ts — Wallet connect/disconnect + Midnight provider setup
 *
 * The DApp Connector API is injected by Midnight 1AM Wallet / extensions into:
 *   window.midnight
 */

// Midnight DApp Connector API type
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

// Detected wallet info
export interface DetectedWallet {
  name: string;
  api: MidnightConnectorAPI;
}

// Detect 1AM or Midnight wallet extension
export function detectWallet(): DetectedWallet | null {
  try {
    const w = window as unknown as {
      midnight?: Record<string, MidnightConnectorAPI>;
    };
    if (!w.midnight) return null;

    const keys = Object.keys(w.midnight);

    // 1. Prioritize 1AM Wallet specific keys
    const oneAmKey = keys.find(
      (k) =>
        k.toLowerCase().includes("1am") ||
        k.toLowerCase().includes("oneam")
    );

    if (oneAmKey && w.midnight[oneAmKey]) {
      return {
        name: "1AM Wallet",
        api: w.midnight[oneAmKey],
      };
    }

    // 2. Fallback to any injected Midnight DApp Connector wallet
    for (const key of keys) {
      const candidate = w.midnight[key];
      if (candidate && typeof candidate.enable === "function") {
        const walletName = candidate.name || (key.toLowerCase().includes("lace") ? "Lace Wallet" : "1AM Wallet");
        return {
          name: walletName,
          api: candidate,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Connection result
export interface WalletConnection {
  api: ConnectedAPI;
  address: string;
  networkId: string;
  walletName: string;
}

// Connect to 1AM / Midnight wallet on Preprod
export async function connectWallet(): Promise<WalletConnection> {
  const detected = detectWallet();
  if (!detected) {
    throw new Error(
      "1AM Wallet not detected. Please install or enable the 1AM Wallet extension for Midnight Network."
    );
  }

  // Enable the connector (triggers 1AM wallet permission popup)
  const enabledApi = await detected.api.enable();

  // Connect to the configured network (preprod)
  const connectedApi = await enabledApi.connect(MIDNIGHT_CONFIG.networkId);

  // Retrieve the shielded address
  const address = await connectedApi.getShieldedAddress();

  return {
    api: connectedApi,
    address,
    networkId: MIDNIGHT_CONFIG.networkId,
    walletName: detected.name,
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
