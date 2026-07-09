interface SupabaseErrorLike {
  message: string;
}

/** Throws with repository context instead of letting a Supabase error pass silently. */
export function assertNoError(error: SupabaseErrorLike | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

/** Unwraps a list-query response, throwing on error instead of falling back to []. */
export function unwrapList<T>(
  result: { data: T[] | null; error: SupabaseErrorLike | null },
  context: string
): T[] {
  assertNoError(result.error, context);
  return result.data ?? [];
}

/** Unwraps a maybeSingle()-style response, throwing on error instead of falling back to null. */
export function unwrapMaybe<T>(
  result: { data: T | null; error: SupabaseErrorLike | null },
  context: string
): T | null {
  assertNoError(result.error, context);
  return result.data;
}
