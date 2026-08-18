export function indexerPublicDataProvider(indexerUri, indexerWsUri) {
  return {
    queryContractState: async (address) => {
      return { yes_count: 0n, no_count: 0n, total_votes: 0n };
    },
    queryBlockHeight: async () => 1024,
  };
}

export function httpClientProofProvider(proofServerUri, zkConfigProvider) {
  return {
    generateProof: async (circuit, witness) => ({ proof: "0xzk_proof" }),
  };
}

export function levelPrivateStateProvider(config) {
  const store = new Map();
  return {
    get: async (k) => store.get(k),
    set: async (k, v) => store.set(k, v),
    remove: async (k) => store.delete(k),
  };
}

export function fetchZkConfigProvider(uri) {
  return {
    getProverKey: async () => new Uint8Array(32),
    getVerifierKey: async () => new Uint8Array(32),
  };
}
