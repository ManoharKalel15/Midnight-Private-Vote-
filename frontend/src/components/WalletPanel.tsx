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

  const handleOpenPopupWindow = () => {
    // 1. Also try window.midnight extension enable if available
    try {
      const w = (window as unknown as { midnight?: Record<string, any> }).midnight;
      if (w) {
        const keys = Object.keys(w);
        const oneAmKey = keys.find(
          (k) => k === "1am" || k === "1AM" || k.toLowerCase().includes("1am")
        ) || keys[0];

        if (oneAmKey && w[oneAmKey] && typeof w[oneAmKey].enable === "function") {
          w[oneAmKey].enable().catch(() => {});
        }
      }
    } catch {}

    // 2. Launch standalone 1AM Wallet Popup Window on desktop
    const width = 380;
    const height = 620;
    const left = window.screen.width - width - 40;
    const top = 80;

    window.open(
      "/1am-wallet-popup.html",
      "1AM_Wallet_Authorization_Popup",
      `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=no,status=no,location=no,toolbar=no`
    );
  };

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
        <span className="network-badge">{networkId}</span>
      </div>

      {walletStatus !== "connected" && (
        <div className="wallet-state">
          <div className="state-icon idle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
            </svg>
          </div>
          <p className="state-text">Click below to open the 1AM Wallet popup window</p>
          <button className="btn btn-primary btn-connect" onClick={handleOpenPopupWindow}>
            <span className="btn-glow" />
            ⚡ Open 1AM Wallet Popup Window
          </button>
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
          <button className="btn btn-danger btn-sm" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
