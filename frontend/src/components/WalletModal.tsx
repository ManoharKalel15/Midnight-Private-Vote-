import { useState } from "react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  walletName?: string;
  networkId?: string;
}

export function WalletModal({
  isOpen,
  onClose,
  onApprove,
  walletName = "1AM Wallet",
  networkId = "preprod",
}: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "nfts" | "txs" | "apps">("apps");
  const [isApproving, setIsApproving] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsApproving(false);
    onApprove();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* 1AM Extension Window Mockup */}
      <div className="oneam-extension-window" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header Bar */}
        <div className="oneam-header">
          <div className="oneam-brand">
            <span className="oneam-clock-icon">🕒</span>
            <span className="oneam-title">1AM</span>
          </div>

          <div className="oneam-status-pills">
            <div className="status-pill green">
              <span className="dot" />
              <span>PREV • SYNCED</span>
            </div>
            <div className="status-pill green">
              <span className="dot" />
              <span>DUST SPONSORED</span>
            </div>
          </div>

          <div className="oneam-header-right">
            <button className="expand-btn" title="Expand view" onClick={onClose}>⤢</button>
            <div className="avatar-box">WA</div>
          </div>
        </div>

        {/* DApp Authorization Banner */}
        <div className="oneam-dapp-banner">
          <div className="banner-left">
            <span className="banner-icon">⚡</span>
            <div>
              <div className="banner-title">Connection Requested</div>
              <div className="banner-sub">Rise In — Level 2 (Midnight Vote)</div>
            </div>
          </div>
          <button 
            className="oneam-approve-btn" 
            onClick={handleApprove} 
            disabled={isApproving}
          >
            {isApproving ? "Connecting..." : "Approve Connect"}
          </button>
        </div>

        {/* Extension Body Content */}
        <div className="oneam-body">
          {/* Shielded Holdings */}
          <div className="holdings-card">
            <div className="card-top">
              <div className="card-label">
                <span className="shield-icon">🛡</span>
                <span>SHIELDED HOLDINGS</span>
              </div>
              <button className="hide-btn">HIDE 👁</button>
            </div>
            <div className="balance-val">0</div>
            <div className="card-subtext">Shielded tokens in this wallet</div>
          </div>

          {/* Unshielded Balance */}
          <div className="holdings-card">
            <div className="card-top">
              <div className="card-label">
                <span className="lightning-icon">⚡</span>
                <span>UNSHIELDED BALANCE</span>
              </div>
              <button className="hide-btn">HIDE 👁</button>
            </div>
            <div className="balance-val">0.0</div>
            <div className="card-subtext">Sum of all unshielded NIGHT tokens</div>
          </div>

          {/* Cardano Balance */}
          <div className="holdings-card">
            <div className="card-top">
              <div className="card-label">
                <span className="cardano-icon">❖</span>
                <span>CARDANO BALANCE</span>
              </div>
              <button className="hide-btn">HIDE 👁</button>
            </div>
            <div className="balance-val">0.0</div>
            <div className="card-subtext">ADA: 0.0</div>
          </div>

          {/* Quick Actions */}
          <div className="oneam-actions">
            <button className="action-btn">
              <span className="action-icon">✈</span>
              <span>SEND</span>
            </button>
            <div className="divider" />
            <button className="action-btn">
              <span className="action-icon">⊞</span>
              <span>RECEIVE</span>
            </button>
            <div className="divider" />
            <button className="action-btn">
              <span className="action-icon">⚡</span>
              <span>YOUR DUST</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="oneam-tabs">
          <button 
            className={`tab ${activeTab === "assets" ? "active" : ""}`}
            onClick={() => setActiveTab("assets")}
          >
            ASSETS
          </button>
          <button 
            className={`tab ${activeTab === "nfts" ? "active" : ""}`}
            onClick={() => setActiveTab("nfts")}
          >
            NFTS
          </button>
          <button 
            className={`tab ${activeTab === "txs" ? "active" : ""}`}
            onClick={() => setActiveTab("txs")}
          >
            TRANSACTIONS
          </button>
          <button 
            className={`tab ${activeTab === "apps" ? "active" : ""}`}
            onClick={() => setActiveTab("apps")}
          >
            APPS
          </button>
        </div>
      </div>
    </div>
  );
}
