import { useSyncExternalStore } from "react";

// Lightweight in-memory session store (cleared on page reload).
type State = {
  emailHandoff: string | null;
  promptHandoff: { tool: "email" | "research" | "chat"; text: string } | null;
};
let state: State = { emailHandoff: null, promptHandoff: null };
const listeners = new Set<() => void>();

export function setSession(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export function getSession() {
  return state;
}
export function useSession() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}
