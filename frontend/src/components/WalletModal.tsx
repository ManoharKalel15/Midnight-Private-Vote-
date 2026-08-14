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
  const [isApproving, setIsApproving] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsApproving(false);
    onApprove();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wallet-popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="popup-badge">
            <span className="popup-icon">⚡</span>
            <span>1AM Wallet DApp Connector</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="popup-body">
          <div className="wallet-avatar">
            <span className="avatar-icon">🌙</span>
          </div>

          <h3 className="popup-title">Connect {walletName}?</h3>
          <p className="popup-subtitle">
            <strong>Rise In — Level 2 (Midnight Vote)</strong> requests permission to view your shielded address and cast ZK votes on <code>{networkId}</code>.
          </p>

          <div className="popup-permissions-box">
            <div className="permission-item">
              <span className="check">✓</span>
              <span>View shielded Midnight address</span>
            </div>
            <div className="permission-item">
              <span className="check">✓</span>
              <span>Generate ZK-SNARK witness proofs locally</span>
            </div>
            <div className="permission-item">
              <span className="check">✓</span>
              <span>Submit zero-knowledge vote transactions</span>
            </div>
          </div>
        </div>

        <div className="popup-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isApproving}>
            Cancel
          </button>
          <button className="btn btn-primary btn-approve" onClick={handleApprove} disabled={isApproving}>
            {isApproving ? "Connecting..." : "Approve Connection →"}
          </button>
        </div>
      </div>
    </div>
  );
}
