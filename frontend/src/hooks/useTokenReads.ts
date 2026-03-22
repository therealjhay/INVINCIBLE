import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { setTokenSnapshot } from "./tokenStore";

export interface TokenData {
  // Read 1 — token metadata
  name:    string;
  symbol:  string;
  decimals: number;
  // Read 2 — supply stats
  totalSupply:       string;  // formatted, human-readable
  maxSupply:         string;
  supplyPct:         number;  // 0–100, for progress bar
  // Read 3 — faucet config
  faucetAmount:      string;
  // Read 4 — remaining mintable
  remainingMintable: string;
  // Read 5 — per-user state (requires wallet)
  userBalance:        string;
  cooldownRemaining:  number;  // seconds, 0 = can claim
  nextClaimTime:      number;  // unix timestamp, 0 = can claim
  // Meta
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

function fmt(val: ethers.BigNumber, decimals = 18): string {
  return parseFloat(ethers.utils.formatUnits(val, decimals)).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function useTokenReads(
  readContract: ethers.Contract | null,
  account:      string | null
): TokenData {
  const [state, setState] = useState<Omit<TokenData, "refetch">>({
    name:              "",
    symbol:            "",
    decimals:          18,
    totalSupply:       "0",
    maxSupply:         "0",
    supplyPct:         0,
    faucetAmount:      "0",
    remainingMintable: "0",
    userBalance:       "0",
    cooldownRemaining:  0,
    nextClaimTime:      0,
    loading:           true,
    error:             null,
  });

  const fetchAll = useCallback(async () => {
    if (!readContract) return;
    try {
      // Read 1: metadata
      // Read 2: supply data
      // Read 3: faucet amount
      // Read 4: remaining mintable
      // Read 5: user-specific (balance + cooldown)
      const [name, symbol, decimals, totalSupply, maxSupply, faucetAmount, remainingMintable] =
        await Promise.all([
          readContract.name(),
          readContract.symbol(),
          readContract.decimals(),
          readContract.totalSupply(),      // Read 2a
          readContract.MAX_SUPPLY(),       // Read 2b
          readContract.FAUCET_AMOUNT(),    // Read 3
          readContract.remainingMintable(), // Read 4
        ]);

      const supplyPct = totalSupply.mul(10000).div(maxSupply).toNumber() / 100;

      let userBalance       = ethers.BigNumber.from(0);
      let cooldownRemaining = ethers.BigNumber.from(0);
      let nextClaimTime     = ethers.BigNumber.from(0);

      if (account) {
        // Read 5: per-user reads
        [userBalance, cooldownRemaining, nextClaimTime] = await Promise.all([
          readContract.balanceOf(account),
          readContract.cooldownRemaining(account),
          readContract.nextClaimTime(account),
        ]);
      }

      const formattedUserBalance = fmt(userBalance, decimals);
      setTokenSnapshot({ userBalance: formattedUserBalance, symbol });

      setState({
        name,
        symbol,
        decimals,
        totalSupply:       fmt(totalSupply, decimals),
        maxSupply:         fmt(maxSupply, decimals),
        supplyPct,
        faucetAmount:      fmt(faucetAmount, decimals),
        remainingMintable: fmt(remainingMintable, decimals),
        userBalance:       formattedUserBalance,
        cooldownRemaining: cooldownRemaining.toNumber(),
        nextClaimTime:     nextClaimTime.toNumber(),
        loading:           false,
        error:             null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [readContract, account]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 15_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
