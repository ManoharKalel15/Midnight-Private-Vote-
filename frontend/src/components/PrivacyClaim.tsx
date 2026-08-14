export function PrivacyClaim() {
  return (
    <div className="card privacy-card">
      <div className="card-header">
        <div className="card-icon privacy-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h2 className="card-title">Privacy Claim</h2>
        <span className="zk-badge">ZK Proven</span>
      </div>

      <div className="privacy-claim-body">
        <div className="claim-main">
          <div className="claim-visual">
            <div className="chain-block public-block">
              <span className="block-label">On-Chain (Public)</span>
              <div className="block-content">
                <div className="data-row visible">✅ yes_count += 1</div>
                <div className="data-row visible">✅ total_votes += 1</div>
              </div>
            </div>
            <div className="arrow-down">↓ ZK Proof</div>
            <div className="chain-block private-block">
              <span className="block-label">Off-Chain (Private)</span>
              <div className="block-content">
                <div className="data-row hidden">🔒 vote = true (hidden)</div>
                <div className="data-row hidden">🔒 voter = Alice (hidden)</div>
              </div>
            </div>
          </div>

          <div className="claim-text">
            <h3 className="claim-heading">What Is Proven Without Being Shown</h3>
            <ul className="claim-list">
              <li>
                <span className="claim-check">✓</span>
                A valid vote was cast (YES or NO — not revealed)
              </li>
              <li>
                <span className="claim-check">✓</span>
                The tally incremented correctly
              </li>
              <li>
                <span className="claim-check">✓</span>
                No votes were fabricated or double-counted
              </li>
            </ul>

            <div className="privacy-property">
              <strong>Observable Privacy:</strong> Anyone can verify the tally grew by 1.
              Nobody — not the node operators, indexer, or other users — can learn
              whether the voter chose YES or NO.
            </div>
          </div>
        </div>

        <div className="how-it-works">
          <h4>How the ZK Proof Works</h4>
          <ol className="steps-list">
            <li>
              <span className="step-num">1</span>
              Your vote (YES/NO) is passed to the <code>cast_vote</code> circuit
              as a <em>witness</em> — private off-chain data
            </li>
            <li>
              <span className="step-num">2</span>
              The proof server generates a ZK-SNARK proving the circuit ran
              correctly, without embedding the vote value in the proof
            </li>
            <li>
              <span className="step-num">3</span>
              The proof is verified on-chain; only <code>yes_count</code> or{" "}
              <code>no_count</code> increments (but the proof doesn&apos;t say which)
            </li>
            <li>
              <span className="step-num">4</span>
              Your vote is gone — not in the transaction, not in the proof,
              not in the chain state
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}