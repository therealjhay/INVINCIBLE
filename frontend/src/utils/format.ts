export function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Parses "COOLDOWN:<seconds>" from a contract revert message.
 * Returns the number of seconds, or null if the message is unrelated.
 */
export function parseCooldownFromRevert(message: string): number | null {
  const match = message.match(/COOLDOWN:(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extracts a human-readable error from an ethers.js error object.
 */
export function extractError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  const obj = err as {
    reason?: string;
    error?: { message?: string };
    data?: { message?: string };
    message?: string;
  };
  return (
    obj?.reason ??
    obj?.error?.message ??
    obj?.data?.message ??
    obj?.message ??
    "Unknown error"
  );
}
