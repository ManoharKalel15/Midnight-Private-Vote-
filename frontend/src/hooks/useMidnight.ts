import { useState, useEffect, useCallback, useRef } from "react";
import {
  detectWallet,
  connectWallet,
  disconnectWallet,
  formatAddress,
  type WalletConnection,
  type EnabledAPI,
  MIDNIGHT_CONFIG,
} from "../api/midnight";
import {
  deployNewContract,
  findExistingContract,
  castVote,
  readPublicState,
  getExplorerUrl,
  getTxExplorerUrl,
  type DeployedContract,
  type PublicState,
  type TransactionResult,
} from "../api/contract";

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
  walletStatus: WalletStatus;
  walletName: string;
  walletAddress: string;
  walletAddressShort: string;
  networkId: string;
  errorMessage: string;

  contractAddress: string;
  explorerUrl: string;
  publicState: PublicState;

  voteStatus: VoteStatus;
  lastTxHash: string;
  txExplorerUrl: string;
  voteError: string;

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
  const [walletName, setWalletName] = useState("Lace Wallet");
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
  const [txExplorerUrl, setTxExplorerUrl] = useState("");
  const [voteError, setVoteError] = useState("");

  const connectionRef = useRef<WalletConnection | null>(null);
  const enabledApiRef = useRef<EnabledAPI | null>(null);
  const contractRef = useRef<DeployedContract | null>(null);
  const isConnectingRef = useRef(false);

  // Check wallet installation on mount
  useEffect(() => {
    let mounted = true;
    const check = () => {
      if (!mounted) return;
      const detected = detectWallet();
      if (detected) {
        setWalletStatus("installed");
        setWalletName(detected.name);
      } else {
        setWalletStatus("installed");
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, []);

  // Connect to Lace Wallet and load contract
  const connect = useCallback(async () => {
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;
    setWalletStatus("connecting");
    setErrorMessage("");

    try {
      console.log("[Midnight Hook] Connecting to Lace Wallet on Preprod...");
      const connection = await connectWallet();
      connectionRef.current = connection;
      enabledApiRef.current = connection.enabledApi;

      setWalletAddress(connection.address);
      setNetworkId(connection.networkId);
      setWalletName(connection.walletName);

      // Initialize Midnight contract
      const targetAddress =
        MIDNIGHT_CONFIG.contractAddress ||
        "mn15kps98k9sbilb4delc68b1lduq6gjqfjf3kvuf4lnezfkat56kp3ue6zq0";

      let contract: DeployedContract;
      if (targetAddress) {
        contract = await findExistingContract(connection.connectedApi, targetAddress);
        setContractAddress(targetAddress);
      } else {
        contract = await deployNewContract(connection.connectedApi);
        setContractAddress(contract.address);
      }

      contractRef.current = contract;

      // Query on-chain public state
      const state = await readPublicState(contract);
      setPublicState(state);

      setWalletStatus("connected");
      console.log("[Midnight Hook] Wallet & Contract ready on Preprod.");
    } catch (err: any) {
      console.error("[Midnight Hook] Connect error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setWalletStatus("error");
    } finally {
      isConnectingRef.current = false;
    }
  }, []);

  // Disconnect cleanly
  const disconnect = useCallback(async () => {
    console.log("[Midnight Hook] Disconnecting wallet...");
    if (enabledApiRef.current) {
      await disconnectWallet(enabledApiRef.current);
    }
    connectionRef.current = null;
    enabledApiRef.current = null;
    contractRef.current = null;

    setWalletAddress("");
    setWalletStatus("installed");
    setErrorMessage("");
    setVoteStatus("idle");
    setVoteError("");
    setLastTxHash("");
    setTxExplorerUrl("");
    setPublicState(INITIAL_PUBLIC_STATE);
  }, []);

  // Vote circuit invocation with ZK proof
  const vote = useCallback(
    async (choice: boolean) => {
      if (!contractRef.current || walletStatus !== "connected") {
        setVoteError("Please connect your Lace Wallet first.");
        return;
      }

      setVoteStatus("generating_proof");
      setVoteError("");
      setLastTxHash("");
      setTxExplorerUrl("");

      try {
        console.log(`[Midnight Hook] Generating ZK proof for private vote: [choice hidden off-chain]`);

        // Update to submitting state after proof is computed
        setTimeout(() => {
          setVoteStatus((curr) => (curr === "generating_proof" ? "submitting" : curr));
        }, 1500);

        const result: TransactionResult = await castVote(
          contractRef.current,
          choice
        );

        setLastTxHash(result.txHash);
        setTxExplorerUrl(getTxExplorerUrl(result.txHash));
        setVoteStatus("confirmed");

        // Immediately update state from transaction result or query
        if (result.publicState) {
          setPublicState(result.publicState);
        } else if (contractRef.current) {
          const freshState = await readPublicState(contractRef.current);
          setPublicState(freshState);
        }

        setTimeout(() => {
          setVoteStatus("idle");
        }, 6000);
      } catch (err: any) {
        console.error("[Midnight Hook] Circuit invocation error:", err);
        const msg = err instanceof Error ? err.message : String(err);
        setVoteError(msg);
        setVoteStatus("error");
      }
    },
    [walletStatus]
  );

  // Poll state periodically when connected
  useEffect(() => {
    if (walletStatus !== "connected" || !contractRef.current) return;

    const interval = setInterval(async () => {
      if (contractRef.current) {
        try {
          const state = await readPublicState(contractRef.current);
          setPublicState(state);
        } catch {}
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [walletStatus]);

  const refreshState = useCallback(async () => {
    if (!contractRef.current) return;
    try {
      const state = await readPublicState(contractRef.current);
      setPublicState(state);
    } catch {}
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
    txExplorerUrl,
    voteError,
    connect,
    disconnect,
    vote,
    refreshState,
  };
}
