import { useEffect, useState, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import ViltrumABI from "../abi/Viltrum.json";
import { CONTRACT_ADDRESS, CHAIN_ID } from "../abi/constants";
import { useAppKitProvider, useAppKitAccount, useAppKitNetwork, useAppKit } from "@reown/appkit/react";

export interface ContractState {
  provider:         ethers.providers.Web3Provider | null;
  signer:           ethers.Signer | null;
  contract:         ethers.Contract | null;   // write-capable
  readContract:     ethers.Contract | null;   // read-only, always available
  account:          string | null;
  chainId:          number | null;
  isConnected:      boolean;
  isCorrectNetwork: boolean;
  connect:          () => Promise<void>;
  disconnect:       () => void;
}

const RPC_FALLBACK = import.meta.env.VITE_RPC_URL ?? "https://rpc.sepolia.org";

function makeReadContract(): ethers.Contract {
  const rpc = new ethers.providers.JsonRpcProvider(RPC_FALLBACK);
  return new ethers.Contract(CONTRACT_ADDRESS, ViltrumABI, rpc);
}

export function useContract(): ContractState {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const { caipNetwork } = useAppKitNetwork();
  const { open } = useAppKit();

  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [readContract] = useState<ethers.Contract>(() => makeReadContract());

  const numericChainId = useMemo(() => {
    if (!caipNetwork) return null;
    return Number(caipNetwork.id);
  }, [caipNetwork]);

  useEffect(() => {
    if (isConnected && walletProvider) {
      // Create ethers5 provider wrapping the AppKit walletProvider
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider as any);
      const ethersSigner = ethersProvider.getSigner();

      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(new ethers.Contract(CONTRACT_ADDRESS, ViltrumABI, ethersSigner));
    } else {
      setProvider(null);
      setSigner(null);
      setContract(null);
    }
  }, [isConnected, walletProvider]);

  const connect = useCallback(async () => {
    await open();
  }, [open]);

  const disconnect = useCallback(() => {
    open({ view: 'Account' });
  }, [open]);

  return {
    provider,
    signer,
    contract,
    readContract,
    account: address && isConnected ? address : null,
    chainId: numericChainId,
    isConnected: !!(isConnected && address),
    isCorrectNetwork: numericChainId === CHAIN_ID,
    connect,
    disconnect,
  };
}
