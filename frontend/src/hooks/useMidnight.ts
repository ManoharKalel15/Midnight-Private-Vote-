/**
 * useMidnight.ts — React hook that orchestrates all Midnight DApp logic
 *
 * Manages the full lifecycle:
 *   wallet detection → connect → deploy/find contract → cast votes → disconnect
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  detectWallet,
  connectWallet,
  formatAddress,
  type WalletConnection,
  type EnabledAPI,
} from "../api/midnight";
import {
  deployNewContract,
  findExistingContract,
  castVote,
  readPublicState,
  getExplorerUrl,
  type DeployedContract,
  type PublicState,
  type TransactionResult,
} from "../api/contract";
import { MIDNIGHT_CONFIG } from "../api/midnight";

export type WalletStatus =
  | "not_installed"
  | "installed"
  | "connecting"
  | "connected"
  | "error";

export type VoteStatus =
  | "idle"
  | "generating_proof"
  | "submitting"
  | "confirmed"
  | "error";

export interface MidnightState {
  // Wallet state
  walletStatus: WalletStatus;
  walletName: string;
  walletAddress: string;
  walletAddressShort: string;
  networkId: string;
  errorMessage: string;

  // Contract state
  contractAddress: string;
  explorerUrl: string;
  publicState: PublicState;

  // Vote/TX state
  voteStatus: VoteStatus;
  lastTxHash: string;
  voteError: string;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  vote: (choice: boolean) => Promise<void>;
  refreshState: () => Promise<void>;
}

const INITIAL_PUBLIC_STATE: PublicState = {
  yes_count: 0n,
  no_count: 0n,
  total_votes: 0n,
};

export function useMidnight(): MidnightState {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>("installed");
  const [walletName, setWalletName] = useState("1AM Wallet");
  const [walletAddress, setWalletAddress] = useState("");
  const [networkId, setNetworkId] = useState(MIDNIGHT_CONFIG.networkId);
  const [errorMessage, setErrorMessage] = useState("");

  const [contractAddress, setContractAddress] = useState(
    MIDNIGHT_CONFIG.contractAddress
  );
  const [publicState, setPublicState] = useState<PublicState>(
    INITIAL_PUBLIC_STATE
  );

  const [voteStatus, setVoteStatus] = useState<VoteStatus>("idle");
  const [lastTxHash, setLastTxHash] = useState("");
  const [voteError, setVoteError] = useState("");

  // Refs to hold live instances (not put in state to avoid stale closures)
  const connectionRef = useRef<WalletConnection | null>(null);
  const enabledApiRef = useRef<EnabledAPI | null>(null);
  const contractRef = useRef<DeployedContract | null>(null);

  // ── Detect wallet on mount ─────────────────────────────────────────────────
  useEffect(() => {
    // Give the wallet extension a moment to inject itself
    const timer = setTimeout(() => {
      const detected = detectWallet();
      if (!detected) {
        setWalletStatus("not_installed");
      } else {
        setWalletStatus("installed");
        setWalletName(detected.name);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // ── Auto-refresh public state every 10 seconds when connected ─────────────
  useEffect(() => {
    if (walletStatus !== "connected" || !contractRef.current) return;

    const interval = setInterval(async () => {
      if (contractRef.current) {
        const state = await readPublicState(contractRef.current);
        setPublicState(state);
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [walletStatus]);

  // ── Connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    setWalletStatus("connecting");
    setErrorMessage("");

    try {
      const connection = await connectWallet();
      connectionRef.current = connection;
      setWalletAddress(connection.address);
      setNetworkId(connection.networkId);
      setWalletName(connection.walletName);

      // Deploy or find existing contract
      let contract: DeployedContract;
      if (MIDNIGHT_CONFIG.contractAddress) {
        contract = await findExistingContract(
          connection.api,
          MIDNIGHT_CONFIG.contractAddress
        );
        setContractAddress(MIDNIGHT_CONFIG.contractAddress);
      } else {
        contract = await deployNewContract(connection.api);
        setContractAddress(contract.address);
      }

      contractRef.current = contract;

      // Load initial state
      const state = await readPublicState(contract);
      setPublicState(state);

      setWalletStatus("connected");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setWalletStatus("error");
    }
  }, []);

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    if (enabledApiRef.current) {
      try {
        if (typeof enabledApiRef.current.disconnect === "function") { await enabledApiRef.current.disconnect(); }
      } catch {
        // Ignore disconnect errors
      }
    }
    connectionRef.current = null;
    enabledApiRef.current = null;
    contractRef.current = null;
    setWalletAddress("");
    setWalletStatus("installed");
    setContractAddress(MIDNIGHT_CONFIG.contractAddress);
    setPublicState(INITIAL_PUBLIC_STATE);
    setLastTxHash("");
    setVoteStatus("idle");
    setVoteError("");
  }, []);

  // ── Cast vote ──────────────────────────────────────────────────────────────
  const vote = useCallback(async (choice: boolean) => {
    if (!contractRef.current || walletStatus !== "connected") {
      setVoteError("Please connect your wallet first.");
      return;
    }

    setVoteStatus("generating_proof");
    setVoteError("");
    setLastTxHash("");

    try {
      let result: TransactionResult;

      setVoteStatus("submitting");
      result = await castVote(contractRef.current, choice);

      setLastTxHash(result.txHash);
      setVoteStatus("confirmed");

      // Refresh public state to show updated tally
      const state = await readPublicState(contractRef.current);
      setPublicState(state);

      // Reset vote status after 5 seconds
      setTimeout(() => setVoteStatus("idle"), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setVoteError(msg);
      setVoteStatus("error");
    }
  }, [walletStatus]);

  // ── Refresh state ──────────────────────────────────────────────────────────
  const refreshState = useCallback(async () => {
    if (!contractRef.current) return;
    const state = await readPublicState(contractRef.current);
    setPublicState(state);
  }, []);

  return {
    walletStatus,
    walletName,
    walletAddress,
    walletAddressShort: formatAddress(walletAddress),
    networkId,
    errorMessage,
    contractAddress,
    explorerUrl: contractAddress ? getExplorerUrl(contractAddress) : "",
    publicState,
    voteStatus,
    lastTxHash,
    voteError,
    connect,
    disconnect,
    vote,
    refreshState,
  };
}
