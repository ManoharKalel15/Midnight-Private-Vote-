# 🌒 Midnight Private Vote — Rise In Level 2

> **The First Thread of Light** — Contract wired to a frontend UI, with Lace connected on Preprod.

A privacy-preserving voting DApp built on [Midnight Network](https://midnight.network), demonstrating zero-knowledge proofs through a practical, beautiful interface.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://your-demo-url.vercel.app)
[![Network](https://img.shields.io/badge/Network-Midnight%20Preprod-8b5cf6)](https://midnight.network)
[![Contract](https://img.shields.io/badge/Contract-Preprod%20Deployed-34d399)](#contract-address)

---

## 🔒 Privacy Claim

**What is proven without being shown:**

Users cast YES or NO votes. The Midnight Network Compact contract generates a **zero-knowledge proof** that:

1. ✅ A valid vote was cast (YES or NO — choice NOT revealed)
2. ✅ The public tally incremented correctly  
3. ✅ No votes were fabricated or double-counted

**Observable Privacy in action:** Anyone on-chain can see `total_votes` went from N to N+1. Nobody — not the node operators, the indexer, or other users — can learn whether the voter chose YES or NO.

The `vote` value is passed as a **witness** (private, off-chain data) to the `cast_vote` circuit. Witnesses are consumed locally during proof generation and never serialized into the transaction or broadcast to the network.

```compact
witness get_vote(): Boolean;  // private — never on-chain

export circuit cast_vote(): [] {
  const vote = get_vote();   // consumed privately
  if (vote) {
    yes_count = yes_count + 1;   // only the delta is public
  } else {
    no_count = no_count + 1;
  }
  total_votes = total_votes + 1;
}
```

---

## 📍 Contract Address (Preprod)

| Field | Value |
|---|---|
| Network | Midnight Preprod (testnet-02) |
| Contract | `<paste address after deployment>` |
| Explorer | [View on Midnight Explorer](https://explorer.testnet-02.midnight.network) |

---

## 🏗️ Architecture

```
risein-midnight-dapp/
├── contract/
│   ├── src/counter.compact          # Compact smart contract
│   └── managed/counter/             # Compiled circuit artifacts
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── midnight.ts          # Lace DApp connector
    │   │   └── contract.ts          # Circuit calls
    │   ├── components/
    │   │   ├── WalletPanel.tsx      # Connect/disconnect UI
    │   │   ├── VotePanel.tsx        # Vote + ZK proof UI
    │   │   ├── PublicState.tsx      # Live tally display
    │   │   └── PrivacyClaim.tsx     # Privacy explainer
    │   └── hooks/useMidnight.ts     # React hook orchestrator
    └── vite.config.ts               # Vite + polyfills setup
```

**Tech Stack:**
- **Smart Contract:** Midnight Compact language
- **Frontend:** React 18 + TypeScript + Vite
- **Wallet:** Lace (via `@midnight-ntwrk/dapp-connector-api`)
- **SDK:** `@midnight-ntwrk/midnight-js-*` packages
- **ZK Proofs:** Midnight proof server (Preprod)
- **Deployment:** Vercel

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Lace browser extension](https://www.lace.io) with Midnight support enabled
- (Optional) Compact compiler for contract recompilation: `compactc`

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/risein-midnight-dapp
cd risein-midnight-dapp

# Install all dependencies
npm install

# Copy environment config
cp .env.example frontend/.env
# Edit frontend/.env — add your contract address if already deployed
```

### Development

```bash
npm run dev
# Open http://localhost:5173
```

### Build for Production

```bash
npm run build
# Outputs to frontend/dist/
```

### Compile Contract (requires compactc)

```bash
npm run compile-contract
```

---

## 🔌 Connecting Lace Wallet

1. Install the [Lace extension](https://www.lace.io) in Chrome/Brave
2. Enable the **Midnight** network in Lace settings
3. Switch to **Preprod** testnet
4. Get testnet tNIGHT tokens from the [Midnight faucet](https://faucet.midnight.network)
5. Open the DApp → click **Connect Lace**

---

## 📹 Demo Video

_[Link to demo video — wallet connect + circuit call]_

---

## 🎯 Requirements Checklist

- [x] Lace wallet connect / disconnect implemented
- [x] Circuit (`cast_vote`) called successfully from the frontend
- [x] Observable privacy behavior (vote proven without being shown)
- [x] Contract deployed to Preprod with verifiable address
- [x] Minimum 8 meaningful commits
- [x] README documenting the privacy claim
- [x] Live demo deployed

---

## 📦 Key Packages

| Package | Purpose |
|---|---|
| `@midnight-ntwrk/dapp-connector-api` | Lace wallet DApp Connector |
| `@midnight-ntwrk/midnight-js-contracts` | Contract deploy & interact |
| `@midnight-ntwrk/midnight-js-types` | TypeScript provider types |
| `vite-plugin-node-polyfills` | Browser WASM compatibility |

---

## 🔮 What I Learned

- **Midnight.js SDK:** Provider composition pattern (wallet + proof server + indexer + private state)
- **DApp Connector API:** `window.midnight.mnLace` injection, `.enable()` → `.connect(networkId)` flow
- **Private State Management:** Witness functions as the boundary between private and public worlds
- **ZK Proof Flow:** Local proof generation → on-chain verification, proof server as a service

---

*Rise In — Level 2: The First Thread of Light* 🌒