// Update these after deploying the contract
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string
  ?? "0xEf744Bd6EEBd80e2c5CA1F9E54B444123b513432";

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 11155111); // Sepolia

export const ETHERSCAN_BASE = "https://sepolia.etherscan.io";
