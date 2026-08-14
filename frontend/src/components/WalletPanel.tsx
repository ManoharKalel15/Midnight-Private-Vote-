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
  walletName = "1AM Wallet",
  walletAddressShort,
  networkId,
  errorMessage,
  onConnect,
  onDisconnect,
}: WalletPanelProps) {
  return (
    <div className="card wallet-card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <path d="M16 12h2"/>
            <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <h2 className="card-title">{walletName}</h2>
        {walletStatus === "connected" && (
          <span className="network-badge">{networkId}</span>
        )}
      </div>

      {walletStatus === "not_installed" && (
        <div className="wallet-state wallet-missing">
          <div className="state-icon warning">⚠</div>
          <p>1AM Wallet extension not detected on page load.</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={onConnect}>
              ⚡ Retry Connect 1AM
            </button>
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Get 1AM Extension →
            </a>
          </div>
        </div>
      )}

      {walletStatus === "installed" && (
        <div className="wallet-state">
          <div className="state-icon idle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
            </svg>
          </div>
          <p className="state-text">Click below to open the 1AM Wallet popup and authorize connection</p>
          <button className="btn btn-primary btn-connect" onClick={onConnect}>
            <span className="btn-glow" />
            Connect {walletName}
          </button>
        </div>
      )}

      {walletStatus === "connecting" && (
        <div className="wallet-state">
          <div className="spinner-ring" />
          <p className="state-text connecting-text">
            Opening 1AM Wallet Popup on <strong>{networkId}</strong>…
          </p>
          <p className="state-subtext">Please approve the connection prompt in your 1AM wallet window</p>
        </div>
      )}

      {walletStatus === "connected" && (
        <div className="wallet-connected">
          <div className="address-row">
            <div className="address-dot" />
            <span className="address-label">Shielded Address ({walletName})</span>
          </div>
          <div className="address-box">
            <code className="address-code">{walletAddressShort}</code>
            <div className="shield-icon" title="Shielded address — privacy preserved">
              🛡️
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={onDisconnect}
          >
            Disconnect
          </button>
        </div>
      )}

      {walletStatus === "error" && (
        <div className="wallet-state">
          <div className="state-icon error">✕</div>
          <p className="error-text">{errorMessage}</p>
          <button className="btn btn-primary" onClick={onConnect}>
            Try Connect Again
          </button>
        </div>
      )}
    </div>
  );
}
