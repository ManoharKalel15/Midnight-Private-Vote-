import type { VoteStatus } from "../hooks/useMidnight";

interface VotePanelProps {
  isConnected: boolean;
  voteStatus: VoteStatus;
  lastTxHash: string;
  txExplorerUrl?: string;
  voteError: string;
  onVote: (choice: boolean) => Promise<void>;
}

export function VotePanel({
  isConnected,
  voteStatus,
  lastTxHash,
  txExplorerUrl,
  voteError,
  onVote,
}: VotePanelProps) {
  const isVoting = voteStatus === "generating_proof" || voteStatus === "submitting";
  const disabled = !isConnected || isVoting;

  return (
    <div className="card vote-card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <h2 className="card-title">Cast Your Vote</h2>
        <span className="privacy-pill">🔒 ZK Private</span>
      </div>

      <p className="vote-description">
        Your vote is proven with a zero-knowledge proof.{" "}
        <strong>Only the tally changes on-chain</strong> — your choice stays private.
      </p>

      {!isConnected && (
        <div className="vote-locked">
          <div className="lock-icon">🔐</div>
          <p>Connect your Lace wallet to vote</p>
        </div>
      )}

      {isConnected && !isVoting && voteStatus !== "confirmed" && (
        <div className="vote-buttons">
          <button
            id="vote-yes-btn"
            className="btn-vote btn-yes"
            disabled={disabled}
            onClick={() => onVote(true)}
          >
            <span className="vote-icon">👍</span>
            <span className="vote-label">Vote YES</span>
            <div className="vote-glow yes-glow" />
          </button>

          <div className="vote-divider">or</div>

          <button
            id="vote-no-btn"
            className="btn-vote btn-no"
            disabled={disabled}
            onClick={() => onVote(false)}
          >
            <span className="vote-icon">👎</span>
            <span className="vote-label">Vote NO</span>
            <div className="vote-glow no-glow" />
          </button>
        </div>
      )}

      {isVoting && (
        <div className="proof-generating">
          <div className="zk-animation">
            <div className="zk-ring zk-ring-1" />
            <div className="zk-ring zk-ring-2" />
            <div className="zk-ring zk-ring-3" />
            <div className="zk-core">⚡</div>
          </div>
          <div className="proof-status">
            {voteStatus === "generating_proof" && (
              <>
                <p className="proof-main">Generating ZK Proof…</p>
                <p className="proof-sub">Your vote witness is sealed off-chain with ZK-SNARKs</p>
              </>
            )}
            {voteStatus === "submitting" && (
              <>
                <p className="proof-main">Submitting to Preprod…</p>
                <p className="proof-sub">Broadcasting transaction via Lace Wallet to Midnight network</p>
              </>
            )}
          </div>
        </div>
      )}

      {voteStatus === "confirmed" && lastTxHash && (
        <div className="vote-confirmed">
          <div className="confirm-icon">✅</div>
          <p className="confirm-title">Vote Confirmed!</p>
          <p className="confirm-sub">Your private vote was proven & recorded on Preprod</p>
          <div className="tx-box">
            <span className="tx-label">TX Hash</span>
            <code className="tx-hash">
              {lastTxHash.slice(0, 12)}…{lastTxHash.slice(-8)}
            </code>
          </div>
          {txExplorerUrl && (
            <a
              href={txExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-explorer-link"
              style={{
                display: "inline-block",
                marginTop: "0.5rem",
                fontSize: "0.85rem",
                color: "#818cf8",
                textDecoration: "underline",
              }}
            >
              View Transaction on Midnight Explorer ↗
            </a>
          )}
        </div>
      )}

      {voteStatus === "error" && voteError && (
        <div className="vote-error">
          <div className="error-icon">⚠️</div>
          <p className="error-text">{voteError}</p>
        </div>
      )}
    </div>
  );
}