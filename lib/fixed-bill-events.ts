const FIXED_BILLS_UPDATED_EVENT = "financy:fixed-bills-updated";

export function emitFixedBillsUpdated(): void {
  window.dispatchEvent(new Event(FIXED_BILLS_UPDATED_EVENT));
}

export function onFixedBillsUpdated(callback: () => void): () => void {
  window.addEventListener(FIXED_BILLS_UPDATED_EVENT, callback);
  return () => window.removeEventListener(FIXED_BILLS_UPDATED_EVENT, callback);
}
