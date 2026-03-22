import { ContractState } from "../hooks/useContract";
import { shortenAddress } from "../utils/format";
import logoUrl from "../assets/logo.svg";

interface HeaderProps extends ContractState {}

const LISK_SEPOLIA_CHAIN_ID_HEX = "0x106a";

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

  const badgeText = !isConnected || isCorrectNetwork ? "Lisk Sepolia" : "Wrong Network";
  const showWarning = isConnected && !isCorrectNetwork;

  const handleSwitchNetwork = async () => {
    const eth = (window as Window & { ethereum?: { request?: (args: EthereumRequest) => Promise<unknown> } }).ethereum;
    if (!eth?.request) return;
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LISK_SEPOLIA_CHAIN_ID_HEX }],
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
          {isConnected && !isCorrectNetwork && (
            <span className={`${badgeClass} hidden md:inline-flex`}>
              {badgeText}
            </span>
          )}

          {/* @ts-ignore */}
          <appkit-button />
        </div>
      </div>

      {showWarning && (
        <div className="warning-bar">
          <div className="warning-inner">
            <p className="warning-text">
              You are connected to the wrong network. Switch to Lisk Sepolia to use the faucet.
            </p>
            <button onClick={handleSwitchNetwork} className="btn-secondary">
              Switch to Lisk Sepolia
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
