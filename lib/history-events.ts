const HISTORY_UPDATED_EVENT = "financy:history-updated";

export function emitHistoryUpdated(): void {
  window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));
}

export function onHistoryUpdated(callback: () => void): () => void {
  window.addEventListener(HISTORY_UPDATED_EVENT, callback);
  return () => window.removeEventListener(HISTORY_UPDATED_EVENT, callback);
}
