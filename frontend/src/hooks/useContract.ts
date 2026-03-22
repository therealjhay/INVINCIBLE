import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import ViltrumABI from "../abi/Viltrum.json";
import { CONTRACT_ADDRESS, CHAIN_ID } from "../abi/constants";

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
  const [provider,     setProvider]     = useState<ethers.providers.Web3Provider | null>(null);
  const [signer,       setSigner]       = useState<ethers.Signer | null>(null);
  const [contract,     setContract]     = useState<ethers.Contract | null>(null);
  const [readContract, setReadContract] = useState<ethers.Contract | null>(() => makeReadContract());
  const [account,      setAccount]      = useState<string | null>(null);
  const [chainId,      setChainId]      = useState<number | null>(null);

  const ethereum = window.ethereum as any;

  const connect = useCallback(async () => {
    if (!ethereum) { alert("MetaMask is not installed."); return; }

    const web3Provider = new ethers.providers.Web3Provider(ethereum);
    await web3Provider.send("eth_requestAccounts", []);
    const web3Signer = web3Provider.getSigner();
    const addr       = await web3Signer.getAddress();
    const net        = await web3Provider.getNetwork();

    setProvider(web3Provider);
    setSigner(web3Signer);
    setContract(new ethers.Contract(CONTRACT_ADDRESS, ViltrumABI, web3Signer));
    setReadContract(new ethers.Contract(CONTRACT_ADDRESS, ViltrumABI, web3Provider));
    setAccount(addr);
    setChainId(net.chainId);
  }, [ethereum]);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setReadContract(makeReadContract());
    setAccount(null);
    setChainId(null);
  }, []);

  // Handle wallet events
  useEffect(() => {
    if (!ethereum) return;

    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnect();
      else { setAccount(accounts[0]); connect(); }
    };
    const onChainChanged = () => window.location.reload();

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged",    onChainChanged);
    return () => {
      ethereum.removeListener("accountsChanged", onAccountsChanged);
      ethereum.removeListener("chainChanged",    onChainChanged);
    };
  }, [connect, disconnect, ethereum]);

  return {
    provider,
    signer,
    contract,
    readContract,
    account,
    chainId,
    isConnected:      !!account,
    isCorrectNetwork: chainId === CHAIN_ID,
    connect,
    disconnect,
  };
}
