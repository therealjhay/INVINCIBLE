import { useMemo, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { ETHERSCAN_BASE } from "../abi/constants";
import { extractError } from "../utils/format";

interface TransferPanelProps {
  contract:    ethers.Contract | null;
  userBalance: string;  // formatted, e.g. "1,234.00"
  refetch:     () => void;
}

function parseFormatted(value: string): ethers.BigNumber {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return ethers.BigNumber.from(0);
  return ethers.utils.parseUnits(cleaned, 18);
}

function parseAmount(value: string): ethers.BigNumber | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return ethers.utils.parseEther(trimmed);
  } catch {
    return null;
  }
}

export default function TransferPanel({ contract, userBalance, refetch }: TransferPanelProps) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balanceBN = useMemo(() => parseFormatted(userBalance), [userBalance]);
  const amountBN = useMemo(() => parseAmount(amount), [amount]);

  let validationError: string | null = null;
  if (!ethers.utils.isAddress(to)) validationError = "Enter a valid recipient address.";
  else if (!amountBN || amountBN.lte(0)) validationError = "Amount must be greater than 0.";
  else if (amountBN.gt(balanceBN)) validationError = "Amount exceeds your balance.";

  const showErrors = !!error;
  const addressInvalid = !ethers.utils.isAddress(to);
  const amountInvalid = !amountBN || amountBN.lte(0);
  const amountExceeds = amountBN ? amountBN.gt(balanceBN) : false;

  const addressErrorMessage =
    (showErrors || to.trim().length > 0) && addressInvalid
      ? "Enter a valid recipient address."
      : "";

  const amountErrorMessage = (showErrors || amount.trim().length > 0)
    ? (amountInvalid
      ? "Amount must be greater than 0."
      : amountExceeds
        ? "Amount exceeds your balance."
        : "")
    : "";

  const addressError = addressErrorMessage !== "";
  const amountError = amountErrorMessage !== "";

  const handleTransfer = async () => {
    if (!contract || !amountBN || validationError) {
      setError(validationError ?? "Check the form fields.");
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const tx = await contract.transfer(to, amountBN);
      await tx.wait(1);
      refetch();
      toast.success(
        <div className="toast-message">
          <span>Transfer complete.</span>
          <a
            href={`${ETHERSCAN_BASE}/tx/${tx.hash}`}
            target="_blank"
            rel="noreferrer"
            className="toast-link"
          >
            View on Etherscan ↗
          </a>
        </div>
      );
    } catch (err: unknown) {
      toast.error(<div className="toast-message">{extractError(err)}</div>);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="card">
      <div>
        <p className="card-label">Transfer</p>
        <h3 className="card-title">Send VIL</h3>
        <p className="card-meta">Balance: {userBalance} VIL</p>
      </div>

      <div className="card-divider" />

      <div className="grid gap-3">
        <div>
          <label className="input-label" htmlFor="transfer-to">
            Recipient Address
          </label>
          <input
            id="transfer-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className={`input ${addressError ? "error" : ""}`}
          />
          <div className="input-error">{addressErrorMessage}</div>
        </div>

        <div>
          <label className="input-label" htmlFor="transfer-amount">
            Amount
          </label>
          <input
            id="transfer-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className={`input ${amountError ? "error" : ""}`}
          />
          <div className="input-error">{amountErrorMessage}</div>
        </div>

        <button
          onClick={handleTransfer}
          disabled={isPending || !!validationError}
          className="btn-secondary"
        >
          {isPending ? "Confirming" : "Send VIL"}
        </button>
      </div>
    </section>
  );
}
