import { useSyncExternalStore } from "react";

export interface TokenSnapshot {
  userBalance: string;
  symbol: string;
}

let snapshot: TokenSnapshot = {
  userBalance: "0",
  symbol: "VIL",
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function setTokenSnapshot(next: Partial<TokenSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

export function useTokenSnapshot(): TokenSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
