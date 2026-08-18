import type { WalletStatus } from "../hooks/useMidnight";

interface WalletPanelProps {
  walletStatus: WalletStatus;
  walletName?: string;
  walletAddressShort: string;
  networkId: string;
  errorMessage: string;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function WalletPanel({
  walletStatus,
  walletName = "Lace Wallet",
  walletAddressShort,
  networkId,
  errorMessage,
  onConnect,
  onDisconnect,
}: WalletPanelProps) {
  const isConnecting = walletStatus === "connecting";
  const isConnected = walletStatus === "connected";
  const hasError = walletStatus === "error" || Boolean(errorMessage);

  return (
    <div className="card wallet-card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M16 12h2" />
            <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h2 className="card-title">{walletName}</h2>
        <span className="network-badge">{networkId.toUpperCase()}</span>
      </div>

      {/* Disconnected / Ready to Connect State */}
      {!isConnected && !isConnecting && (
        <div className="wallet-state">
          <div className="state-icon idle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
            </svg>
          </div>
          <p className="state-text">
            Connect your <strong>Lace Wallet</strong> extension on Midnight Preprod testnet
          </p>
          <button
            id="connect-lace-btn"
            className="btn btn-primary btn-connect"
            onClick={onConnect}
          >
            <span className="btn-glow" />
            ⚡ Connect Lace Wallet
          </button>
        </div>
      )}

      {/* Connecting Spinner State */}
      {isConnecting && (
        <div className="wallet-state connecting">
          <div className="spinner" />
          <p className="state-text">Connecting to Lace Wallet & Preprod...</p>
        </div>
      )}

      {/* Error State Banner */}
      {hasError && !isConnected && !isConnecting && (
        <div className="wallet-error-box" style={{ marginTop: "1rem" }}>
          <div className="error-header">
            <span className="error-icon">⚠️</span>
            <strong>Connection Notice</strong>
          </div>
          <p className="error-message">{errorMessage || "Wallet connection error. Please try again."}</p>
          <button className="btn btn-secondary btn-sm" onClick={onConnect} style={{ marginTop: "0.5rem" }}>
            🔄 Retry Connection
          </button>
        </div>
      )}

      {/* Connected State */}
      {isConnected && (
        <div className="wallet-connected">
          <div className="address-row">
            <div className="address-dot" />
            <span className="address-label">Shielded Address ({walletName})</span>
          </div>
          <div className="address-box">
            <code className="address-code">{walletAddressShort}</code>
            <div className="shield-icon" title="Shielded address — privacy preserved on Preprod">
              🛡️
            </div>
          </div>
          <div className="wallet-actions" style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              id="disconnect-wallet-btn"
              className="btn btn-danger btn-sm"
              onClick={onDisconnect}
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
