import { Toaster } from "react-hot-toast";
import { useContract } from "./hooks/useContract";
import { useTokenReads } from "./hooks/useTokenReads";
import Header       from "./components/Header";
import TokenInfo    from "./components/TokenInfo";
import Faucet       from "./components/Faucet";
import MintPanel    from "./components/MintPanel";
import TransferPanel from "./components/TransferPanel";
import WalletInfo   from "./components/WalletInfo";

export default function App() {
  const contractState = useContract();
  const tokenData     = useTokenReads(contractState.readContract, contractState.account);

  return (
    <div className="app-shell">
      <Toaster
        position="bottom-right"
        containerClassName="toast-container"
        toastOptions={{
          duration: 5000,
          className: "toast",
          icon: null,
          style: { boxShadow: "none" },
          success: { className: "toast success" },
          error: { className: "toast error" },
          loading: { className: "toast pending" },
        }}
      />

      <Header {...contractState} />

      <main className="app-main">
        {contractState.isConnected && contractState.isCorrectNetwork ? (
          <>
            <div className="app-grid">
              <TokenInfo data={tokenData} isConnected={contractState.isConnected} />
              <Faucet
                contract={contractState.contract}
                cooldownSeconds={tokenData.cooldownRemaining}
                refetch={tokenData.refetch}
              />
            </div>

            <div className="app-grid">
              <TransferPanel
                contract={contractState.contract}
                userBalance={tokenData.userBalance}
                refetch={tokenData.refetch}
              />
              <MintPanel
                contract={contractState.contract}
                account={contractState.account}
                remainingMintable={tokenData.remainingMintable}
                refetch={tokenData.refetch}
              />
            </div>

            <WalletInfo
              account={contractState.account!}
              provider={contractState.provider}
            />
          </>
        ) : (
          <TokenInfo data={tokenData} isConnected={contractState.isConnected} />
        )}
      </main>
    </div>
  );
}
