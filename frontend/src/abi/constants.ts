// Update these after deploying the contract
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string
  ?? "0x6FA63Dc97FC20752B422AB24ee8F5d3Ce53836A5";

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 4202); // Lisk Sepolia

export const ETHERSCAN_BASE = "https://sepolia-blockscout.lisk.com";
