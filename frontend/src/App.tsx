import { useMidnight } from "./hooks/useMidnight";
import { WalletPanel } from "./components/WalletPanel";
import { VotePanel } from "./components/VotePanel";
import { PublicStateDisplay } from "./components/PublicState";
import { PrivacyClaim } from "./components/PrivacyClaim";

export default function App() {
  const midnight = useMidnight();
  const isConnected = midnight.walletStatus === "connected";

  return (
    <div className="app-root">
      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-area">
            <div className="logo-icon">🌙</div>
            <div className="logo-text">
              <span className="logo-name">Lace Wallet</span>
              <span className="logo-sep"> · </span>
              <span className="logo-sub">Midnight Preprod</span>
            </div>
          </div>
          <div className="header-right">
            <div className="crescent-badge">
              <span className="crescent">🌒</span>
              <span className="crescent-label">Rise In — Level 2 (Waxing Crescent)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Private Vote on{" "}
          <span className="gradient-text">Midnight Network</span>
        </h1>
        <p className="hero-sub">
          Cast a YES or NO vote with a zero-knowledge proof using Lace Wallet.{" "}
          <br />
          Only the tally is public — your choice is{" "}
          <strong>cryptographically private</strong>.
        </p>
        <div className="hero-pills">
          <span className="pill">⚡ ZK-SNARK Proofs</span>
          <span className="pill">🛡 Lace Shielded Wallet</span>
          <span className="pill">⛓ Preprod Testnet</span>
          <span className="pill">🔒 Compact Contract</span>
        </div>
      </section>

      {/* Main grid */}
      <main className="app-grid">
        {/* Left column */}
        <div className="col-left">
          <WalletPanel
            walletStatus={midnight.walletStatus}
            walletName={midnight.walletName}
            walletAddressShort={midnight.walletAddressShort}
            networkId={midnight.networkId}
            errorMessage={midnight.errorMessage}
            onConnect={midnight.connect}
            onDisconnect={midnight.disconnect}
          />
          <VotePanel
            isConnected={isConnected}
            voteStatus={midnight.voteStatus}
            lastTxHash={midnight.lastTxHash}
            txExplorerUrl={midnight.txExplorerUrl}
            voteError={midnight.voteError}
            onVote={midnight.vote}
          />
        </div>

        {/* Right column */}
        <div className="col-right">
          <PublicStateDisplay
            publicState={midnight.publicState}
            contractAddress={midnight.contractAddress}
            explorerUrl={midnight.explorerUrl}
            onRefresh={midnight.refreshState}
          />
          <PrivacyClaim />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Built for{" "}
          <strong>Rise In — Level 2: The First Thread of Light</strong>
        </p>
        <p className="footer-sub">
          Midnight Network · Compact Contract · Midnight.js Providers · Lace DApp Connector · ZK Proofs
        </p>
      </footer>
    </div>
  );
}
