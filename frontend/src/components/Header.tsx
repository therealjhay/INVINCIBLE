import { ContractState } from "../hooks/useContract";
import { shortenAddress } from "../utils/format";
import logoUrl from "../assets/logo.svg";

interface HeaderProps extends ContractState {}

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

interface EthereumRequest {
  method: string;
  params?: unknown[];
}

export default function Header({
  account,
  isConnected,
  isCorrectNetwork,
  connect,
  disconnect,
}: HeaderProps) {
  const badgeClass = !isConnected || isCorrectNetwork
    ? "network-badge network-badge--ok"
    : "network-badge network-badge--error";

  const badgeText = !isConnected || isCorrectNetwork ? "Sepolia" : "Wrong Network";
  const showWarning = isConnected && !isCorrectNetwork;

  const handleSwitchNetwork = async () => {
    const eth = (window as Window & { ethereum?: { request?: (args: EthereumRequest) => Promise<unknown> } }).ethereum;
    if (!eth?.request) return;
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <img src={logoUrl} alt="Invincible Faucet logo" className="logo-mark" />
          <span className="brand-title">Invincible Faucet</span>
        </div>

        <div className="header-actions">
          <span className={`${badgeClass} hidden md:inline-flex`}>
            {badgeText}
          </span>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <button type="button" className="wallet-button">
                {account ? shortenAddress(account) : ""}
              </button>
              <button type="button" onClick={disconnect} className="wallet-disconnect">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connect} className="wallet-button">
              CONNECT WALLET
            </button>
          )}
        </div>
      </div>

      {showWarning && (
        <div className="warning-bar">
          <div className="warning-inner">
            <p className="warning-text">
              You are connected to the wrong network. Switch to Sepolia to use the faucet.
            </p>
            <button onClick={handleSwitchNetwork} className="btn-secondary">
              Switch to Sepolia
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
