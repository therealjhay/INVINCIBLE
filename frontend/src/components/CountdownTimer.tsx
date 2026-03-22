interface CountdownTimerProps {
  secondsLeft: number;
  formatted: string;
  canClaim: boolean;
}

export default function CountdownTimer({
  secondsLeft,
  formatted,
  canClaim,
}: CountdownTimerProps) {
  const elapsed = Math.max(0, 86400 - secondsLeft);
  const progress = canClaim ? 1 : Math.max(0, Math.min(1, elapsed / 86400));
  const pct = Math.round(progress * 100);

  return (
    <div className="countdown">
      <div className={`countdown-time ${canClaim ? "countdown-ready" : ""}`}>
        {canClaim ? "READY" : formatted}
      </div>
      <div className="countdown-progress">
        <div className="progress-track countdown-track">
          <div
            className={`progress-fill ${canClaim ? "" : "progress-fill-muted"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="countdown-percent">{pct}%</span>
      </div>
    </div>
  );
}
