import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ETHERSCAN_BASE } from "../abi/constants";
import { useTokenSnapshot } from "../hooks/tokenStore";
import { shortenAddress } from "../utils/format";

interface WalletInfoProps {
  account: string;
  provider: ethers.providers.Web3Provider | null;
}

export default function WalletInfo({ account, provider }: WalletInfoProps) {
  const { userBalance, symbol } = useTokenSnapshot();
  const [ethBalance, setEthBalance] = useState("0.00");
  const [copied, setCopied] = useState(false);

  const formatEtherFixed = (value: ethers.BigNumber, decimals: number) => {
    const raw = ethers.utils.formatEther(value);
    const [whole, fraction = ""] = raw.split(".");
    const padded = (fraction + "0".repeat(decimals)).slice(0, decimals);
    return `${whole}.${padded}`;
  };

  useEffect(() => {
    if (!provider) return;
    let active = true;

    const readBalance = async () => {
      try {
        const bal = await provider.getBalance(account);
        if (active) {
          const formatted = formatEtherFixed(bal, 4);
          setEthBalance(formatted);
        }
      } catch {
        if (active) setEthBalance("0.00");
      }
    };

    readBalance();
    const id = setInterval(readBalance, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [account, provider]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="card">
      <div>
        <p className="card-label">Wallet</p>
        <h3 className="card-title">Connected Wallet</h3>
      </div>

      <div className="card-divider" />

      <div className="wallet-info">
        <div className="wallet-row">
          <span className="wallet-address">{shortenAddress(account)}</span>
          <button onClick={handleCopy} className="icon-button" aria-label="Copy address">
            {copied ? "✓" : "⎘"}
          </button>
        </div>

        <div className="wallet-divider" />

        <div className="stat-row-line">
          <span className="stat-label">{symbol} Balance:</span>
          <span className="stat-value">{userBalance}</span>
        </div>
        <div className="stat-row-line">
          <span className="stat-label">ETH Balance:</span>
          <span className="stat-value">{ethBalance}</span>
        </div>

        <a
          href={`${ETHERSCAN_BASE}/address/${account}`}
          target="_blank"
          rel="noreferrer"
          className="wallet-link"
        >
          ↗ View on Etherscan
        </a>
      </div>
    </section>
  );
}
