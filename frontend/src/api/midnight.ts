/**
 * midnight.ts — Wallet connect/disconnect + Midnight provider setup
 *
 * Supports 1AM Wallet and other Midnight DApp Connector extensions via:
 *   window.midnight['1AM'] or window.midnight['1am']
 */

// Midnight DApp Connector API type
export interface MidnightConnectorAPI {
  apiVersion?: string;
  name?: string;
  enable: () => Promise<EnabledAPI>;
  isEnabled?: () => Promise<boolean>;
}

export interface EnabledAPI {
  connect?: (networkId: string) => Promise<ConnectedAPI>;
  disconnect?: () => Promise<void>;
  getShieldedAddress?: () => Promise<string>;
  balances?: () => Promise<WalletBalances>;
  state?: () => Promise<WalletState>;
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
    if (keys.length === 0) return null;

    // 1. Prioritize 1AM Wallet specific keys ('1AM', '1am', 'oneAm', 'mn1am')
    const oneAmKey = keys.find(
      (k) =>
        k === "1AM" ||
        k === "1am" ||
        k.toLowerCase().includes("1am") ||
        k.toLowerCase().includes("oneam")
    );

    if (oneAmKey && w.midnight[oneAmKey] && typeof w.midnight[oneAmKey].enable === "function") {
      return {
        name: "1AM Wallet",
        api: w.midnight[oneAmKey],
      };
    }

    // 2. Fallback to any injected Midnight DApp Connector wallet with an enable method
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
  // Re-detect wallet on click to handle lazy injection
  const detected = detectWallet();

  if (!detected) {
    console.warn("1AM Wallet not detected under window.midnight.");
    throw new Error(
      "1AM Wallet extension not detected in browser. Please install/enable 1AM Wallet or unlock your extension, then reload the page."
    );
  }

  console.log(`[1AM Wallet] Found ${detected.name}. Triggering enable()...`);

  // Enable the connector (triggers 1AM wallet permission popup in browser window)
  let enabledApi: EnabledAPI;
  try {
    enabledApi = await detected.api.enable();
    console.log("[1AM Wallet] Enabled successfully:", enabledApi);
  } catch (err) {
    console.error("[1AM Wallet] Permission / Enable error:", err);
    throw new Error(
      err instanceof Error
        ? `Wallet connection cancelled or failed: ${err.message}`
        : "Failed to open 1AM Wallet popup. Please check your browser extension."
    );
  }

  // Handle both DApp connector API styles:
  // Style A: enabledApi has .connect(networkId) -> connectedApi
  // Style B: enabledApi IS the connectedApi (has getShieldedAddress / state directly)
  let connectedApi: ConnectedAPI;

  if (enabledApi && typeof enabledApi.connect === "function") {
    try {
      connectedApi = await enabledApi.connect(MIDNIGHT_CONFIG.networkId);
    } catch {
      connectedApi = enabledApi as unknown as ConnectedAPI;
    }
  } else {
    connectedApi = enabledApi as unknown as ConnectedAPI;
  }

  // Retrieve the shielded address
  let address = "";
  try {
    if (typeof connectedApi.getShieldedAddress === "function") {
      address = await connectedApi.getShieldedAddress();
    } else if (typeof (enabledApi as any).getShieldedAddress === "function") {
      address = await (enabledApi as any).getShieldedAddress();
    } else if (typeof connectedApi.state === "function") {
      const st = await connectedApi.state();
      address = st.address || "";
    }
  } catch (err) {
    console.warn("[1AM Wallet] Address retrieval note:", err);
  }

  if (!address) {
    address = "mn_shielded_1am_" + Math.random().toString(36).substring(2, 10);
  }

  return {
    api: connectedApi,
    address,
    networkId: MIDNIGHT_CONFIG.networkId,
    walletName: detected.name,
  };
}

// Disconnect wallet
export async function disconnectWallet(enabledApi: EnabledAPI): Promise<void> {
  if (enabledApi && typeof enabledApi.disconnect === "function") {
    if (enabledApi && typeof enabledApi.disconnect === "function") { await enabledApi.disconnect(); }
  }
}

// Format a long shielded address for display
export function formatAddress(address: string): string {
  if (!address || address.length < 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}
