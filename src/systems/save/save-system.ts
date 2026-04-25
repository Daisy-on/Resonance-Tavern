const SAVE_KEY = "cyber-resonance-bar-save";

export function saveGameState(payload: unknown): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function loadGameState<T>(): T | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
