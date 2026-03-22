import { useEffect, useRef, useState } from "react";

export interface CooldownState {
  secondsLeft: number;
  formatted:   string; // "11h 12m 15s"
  canClaim:    boolean;
}

export function useCooldown(cooldownSeconds: number): CooldownState {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Re-seed from contract data whenever it changes
  useEffect(() => {
    setSecondsLeft(cooldownSeconds);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsLeft > 0 ? "active" : "idle"]); // only restart on transition

  function format(s: number): string {
    if (s <= 0) return "";
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [
      h   > 0 ? `${h}h`   : "",
      m   > 0 ? `${m}m`   : "",
      `${sec}s`,
    ].filter(Boolean).join(" ");
  }

  return {
    secondsLeft,
    formatted: format(secondsLeft),
    canClaim:  secondsLeft <= 0,
  };
}
