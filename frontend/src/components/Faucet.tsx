import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import CountdownTimer from "./CountdownTimer";
import { useCooldown } from "../hooks/useCooldown";
import { ETHERSCAN_BASE } from "../abi/constants";
import { extractError, parseCooldownFromRevert } from "../utils/format";

interface FaucetProps {
  contract:         ethers.Contract | null;
  cooldownSeconds:  number;
  refetch:          () => void;
}

const SPINNER_FRAMES = ["[ / ]", "[ — ]", "[ \\\\ ]", "[ | ]"];

export default function Faucet({ contract, cooldownSeconds, refetch }: FaucetProps) {
  const { canClaim, formatted, secondsLeft } = useCooldown(cooldownSeconds);
  const [isPending, setIsPending] = useState(false);
  const [cooldownError, setCooldownError] = useState(false);
  const [spinnerFrame, setSpinnerFrame] = useState(0);

  useEffect(() => {
    if (canClaim) setCooldownError(false);
    if (!isPending) {
      setSpinnerFrame(0);
      return;
    }
    let frame = 0;
    const id = setInterval(() => {
      frame = (frame + 1) % SPINNER_FRAMES.length;
      setSpinnerFrame(frame);
    }, 200);
    return () => clearInterval(id);
  }, [canClaim, isPending]);

  const handleRequest = async () => {
    if (!contract) return;
    setIsPending(true);
    setCooldownError(false);
    try {
      const tx = await contract.requestToken();
      await tx.wait(1);
      refetch();
      toast.success(
        <div className="toast-message">
          <span>Tokens claimed.</span>
          <a
            href={`${ETHERSCAN_BASE}/tx/${tx.hash}`}
            target="_blank"
            rel="noreferrer"
            className="toast-link"
          >
            View on Blockscout ↗
          </a>
        </div>
      );
    } catch (err: unknown) {
      const message = extractError(err);
      const isCooldown = parseCooldownFromRevert(message) !== null;
      if (isCooldown) {
        refetch();
        setCooldownError(true);
      } else {
        toast.error(<div className="toast-message">{message}</div>);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="card-label">Next Claim</p>
          <h3 className="card-title">Faucet</h3>
        </div>
      </div>

      <div className="card-divider" />

      <CountdownTimer secondsLeft={secondsLeft} formatted={formatted} canClaim={canClaim} />

      <button
        onClick={handleRequest}
        disabled={!canClaim || isPending || !contract}
        className="btn-primary mt-6"
      >
        {isPending ? `${SPINNER_FRAMES[spinnerFrame]} CONFIRMING` : "Request 100 VIL"}
      </button>

      {cooldownError && (
        <p className="card-meta text-warning mt-3">You already claimed. {formatted} remaining.</p>
      )}
    </section>
  );
}
