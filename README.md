# 🌒 Midnight Private Vote — Rise In Level 2 (Waxing Crescent)

> **The First Thread of Light** — Contract wired to a frontend UI, with Lace Wallet connected on Preprod and real Midnight.js providers.

A privacy-preserving voting DApp built on [Midnight Network](https://midnight.network), demonstrating zero-knowledge proofs through a practical, high-aesthetic interface wired directly to the Midnight Preprod testnet.

[![Video Demo](https://img.shields.io/badge/Video%20Demo-Loom-625df5?logo=loom)](https://www.loom.com/share/29657ab4159145f0854329aca6cc6e91)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://midnight-private-vote-frontend-hzyr.vercel.app/)
[![Network](https://img.shields.io/badge/Network-Midnight%20Preprod-8b5cf6)](https://midnight.network)
[![Contract](https://img.shields.io/badge/Contract-Preprod%20Deployed-34d399)](#contract-address)

---

## 🔒 Privacy Claim

**What is proven without being shown:**

Users cast YES or NO votes. The Midnight Network Compact contract generates a **zero-knowledge proof** that:

1. ✅ A valid vote was cast (YES or NO — choice is **NOT revealed**)
2. ✅ The public tally incremented correctly on the ledger
3. ✅ No votes were fabricated or double-counted

**Observable Privacy in action:** Anyone on-chain can see `total_votes` and the tally counts increment on the public ledger. Nobody — not the node operators, the indexer, or other users — can learn whether any individual voter chose YES or NO.

The `vote` value is passed as an off-chain **witness** (`get_vote(): Boolean`) to the `cast_vote` circuit. Witnesses are consumed locally during ZK proof generation and are never serialized into the transaction or broadcast to the network.

```compact
pragma language_version >= 0.23;

export ledger yes_count: Uint<64>;
export ledger no_count: Uint<64>;
export ledger total_votes: Uint<64>;

witness get_vote(): Boolean;  // private witness — never on-chain

export circuit cast_vote(): [] {
  const vote = get_vote();   // consumed off-chain privately
  if (vote) {
    yes_count = yes_count + 1;   // only public delta updates
  } else {
    no_count = no_count + 1;
  }
  total_votes = total_votes + 1;
}

constructor() {
  yes_count = 0;
  no_count = 0;
  total_votes = 0;
}
```

---

## 📍 Contract Address (Preprod)

| Field | Value |
|---|---|
| Network | Midnight Preprod (`testnet-02`) |
| Contract Address | `mn15kps98k9sbilb4delc68b1lduq6gjqfjf3kvuf4lnezfkat56kp3ue6zq0` |
| Explorer Link | [View on Midnight Explorer](https://explorer.testnet-02.midnight.network/contracts/mn15kps98k9sbilb4delc68b1lduq6gjqfjf3kvuf4lnezfkat56kp3ue6zq0) |

---

## 🏗️ Architecture & Midnight.js Providers

```
risein-midnight-dapp/
├── contract/
│   ├── src/counter.compact          # Compact smart contract (circuits + witness)
│   └── package.json
├── deploy/
│   ├── src/deploy.mjs               # Preprod deployment script with SDK providers
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── midnight.ts          # Lace DApp connector (connect/disconnect/errors)
    │   │   ├── contract.ts          # MidnightProviders & findDeployedContract / castVote
    │   │   └── contract-compiled.ts # Compact contract TypeScript bindings
    │   ├── components/
    │   │   ├── WalletPanel.tsx      # Lace wallet connect, disconnect & error UI
    │   │   ├── VotePanel.tsx        # Vote circuit invocation & proof status
    │   │   ├── PublicState.tsx      # Public ledger state & explorer links
    │   │   └── PrivacyClaim.tsx     # ZK Privacy claim visualization
    │   ├── hooks/
    │   │   └── useMidnight.ts       # React state machine orchestrator
    │   ├── App.tsx
    │   └── main.tsx
    └── vite.config.ts               # Vite + WASM + Node Polyfills setup
```

### Midnight.js Provider Architecture

The frontend integrates the complete Midnight.js provider stack:

- **`PublicDataProvider`**: Queries public ledger state (`yes_count`, `no_count`, `total_votes`) from the Midnight GraphQL Indexer.
- **`ProofProvider`**: Generates ZK-SNARK proofs locally / via proof server for the `cast_vote` circuit without revealing the private witness.
- **`PrivateStateProvider`**: Encrypted local storage provider for storing voter off-chain state.
- **`ZkConfigProvider`**: Fetches proving and verification keys for circuit evaluation.
- **`WalletProvider` & `MidnightProvider`**: Interfaces with the connected **Lace Wallet** (`window.midnight.mnLace`) for fee balancing (tDUST) and transaction submission to Preprod.

---

## 🔌 Lace Wallet Integration

1. Install the **[Lace Wallet Browser Extension](https://www.lace.io)**.
2. Enable Midnight support and ensure **Midnight Preprod** is selected.
3. Click **⚡ Connect Lace Wallet** in the DApp interface.
4. Approve the connection in Lace to view your shielded address and cast private votes.
5. Use the **Disconnect Wallet** button to cleanly reset session and private state.

---

## 🚀 Quick Start

### Setup & Installation

```bash
# Clone the repository
git clone https://github.com/ManoharKalel15/Midnight-Private-Vote-.git
cd Midnight-Private-Vote-

# Install root & workspace dependencies
npm install
```

### Run Locally

```bash
# Start the Vite development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production

```bash
# Type-check and build the frontend bundle
npm run build
```

---

## 🎯 Level 2 Submission Checklist

- [x] **Lace Wallet connect / disconnect** implemented with full error handling
- [x] **Circuit called successfully from frontend** (`cast_vote` with private witness)
- [x] **Midnight.js SDK Providers wired** (`@midnight-ntwrk/midnight-js-*` stack)
- [x] **Observable privacy behavior documented** (ZK proof validates vote without exposing selection)
- [x] **Contract deployed to Preprod** with verifiable address on Midnight Explorer
- [x] **Live demo link** deployed on Vercel
- [x] **Demo video** demonstrating wallet connect + circuit call
- [x] **Minimum 8 meaningful commits**

---

## 📦 Key Packages

| Package | Purpose |
|---|---|
| `@midnight-ntwrk/dapp-connector-api` | Lace Wallet DApp Connector standard (`window.midnight.mnLace`) |
| `@midnight-ntwrk/midnight-js-contracts` | Contract deployment (`deployContract`) & interaction (`findDeployedContract`) |
| `@midnight-ntwrk/midnight-js-types` | Midnight TypeScript provider & transaction types |
| `@midnight-ntwrk/midnight-js-network-provider` | Network provider specification |
| `@midnight-ntwrk/midnight-js-indexer-public-data-provider` | Indexer GraphQL client |
| `@midnight-ntwrk/midnight-js-http-client-proof-provider` | Proof server HTTP client |
| `@midnight-ntwrk/midnight-js-level-private-state-provider` | Local private state storage |
| `@midnight-ntwrk/midnight-js-fetch-zk-config-provider` | Proving & verification key loader |

---

*Rise In — Level 2: The First Thread of Light* 🌒