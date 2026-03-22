import { TokenData } from "../hooks/useTokenReads";

interface TokenInfoProps {
  data: TokenData;
  isConnected: boolean;
}

export default function TokenInfo({ data, isConnected }: TokenInfoProps) {
  const pct = Math.min(100, Math.max(0, data.supplyPct));

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="card-label">Token Info</p>
          <h2 className="card-title">Token Overview</h2>
        </div>
        <div className="live-indicator">
          <span className="live-dot" />
          <span>Updated live</span>
        </div>
      </div>

      <div className="card-divider" />

      <div className="stat-list">
        <div className="stat-row">
          <div className="stat-row-line">
            <span className="stat-label">Token</span>
            <span className="stat-value">
              {data.name || "Viltrum"} ({data.symbol || "VIL"})
            </span>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-row-line">
            <span className="stat-label">Total Supply</span>
            <span className="stat-value">
              {data.totalSupply} / {data.maxSupply}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="card-meta">{pct.toFixed(2)}% minted</span>
        </div>

        <div className="stat-row">
          <div className="stat-row-line">
            <span className="stat-label">Remaining Mintable</span>
            <span className="stat-value">{data.remainingMintable} VIL</span>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-row-line">
            <span className="stat-label">Faucet Amount</span>
            <span className="stat-value">{data.faucetAmount} VIL</span>
          </div>
        </div>

        {isConnected && (
          <div className="stat-row">
            <div className="stat-row-line">
              <span className="stat-label">Your Balance</span>
              <span className="stat-value">{data.userBalance} VIL</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
