import { useEffect, useRef } from "react";
import type { PublicState } from "../api/contract";

interface PublicStateProps {
  publicState: PublicState;
  contractAddress: string;
  explorerUrl: string;
  onRefresh: () => Promise<void>;
}

// Animate a counter from old value to new value
function useAnimatedCounter(value: bigint): bigint {
  return value; // Simple passthrough — animation is handled via CSS
}

function formatCount(n: bigint): string {
  return n.toLocaleString();
}

function computePercent(part: bigint, total: bigint): number {
  if (total === 0n) return 50;
  return Number((part * 100n) / total);
}

export function PublicStateDisplay({
  publicState,
  contractAddress,
  explorerUrl,
  onRefresh,
}: PublicStateProps) {
  const { yes_count, no_count, total_votes } = publicState;
  const yesPercent = computePercent(yes_count, total_votes);
  const noPercent = computePercent(no_count, total_votes);

  const prevTotal = useRef<bigint>(total_votes);
  const justUpdated = total_votes > prevTotal.current;
  useEffect(() => {
    prevTotal.current = total_votes;
  }, [total_votes]);

  return (
    <div className={`card state-card ${justUpdated ? "state-pulse" : ""}`}>
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <h2 className="card-title">Public Tally</h2>
        <button
          className="refresh-btn"
          onClick={onRefresh}
          title="Refresh from chain"
        >
          ↻
        </button>
      </div>

      <div className="total-votes">
        <span className="total-number">{formatCount(total_votes)}</span>
        <span className="total-label">Total Votes Cast</span>
      </div>

      {/* Visual bar */}
      <div className="vote-bar-container">
        <div
          className="vote-bar yes-bar"
          style={{ width: `${yesPercent}%` }}
        />
        <div
          className="vote-bar no-bar"
          style={{ width: `${noPercent}%` }}
        />
      </div>

      <div className="vote-counts">
        <div className="count-item yes-count">
          <div className="count-dot yes-dot" />
          <span className="count-label">YES</span>
          <span className="count-value">{formatCount(yes_count)}</span>
          <span className="count-pct">{yesPercent.toFixed(0)}%</span>
        </div>
        <div className="count-item no-count">
          <div className="count-dot no-dot" />
          <span className="count-label">NO</span>
          <span className="count-value">{formatCount(no_count)}</span>
          <span className="count-pct">{noPercent.toFixed(0)}%</span>
        </div>
      </div>

      {contractAddress && (
        <div className="contract-address-row">
          <span className="contract-label">📍 Preprod Contract</span>
          <div className="contract-addr-box">
            <code className="contract-addr">
              {contractAddress.slice(0, 12)}…{contractAddress.slice(-8)}
            </code>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-link"
                title="View on Midnight Explorer"
              >
                ↗
              </a>
            )}
          </div>
        </div>
      )}

      <p className="chain-note">
        ⛓ Live on Midnight Preprod — verified on-chain, refreshed every 10s
      </p>
    </div>
  );
}