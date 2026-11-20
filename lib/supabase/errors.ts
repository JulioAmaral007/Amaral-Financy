interface SupabaseErrorLike {
  message: string;
}

/** Lança com o contexto do repositório em vez de deixar um erro do Supabase passar em silêncio. */
export function assertNoError(error: SupabaseErrorLike | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

/** Desembrulha uma consulta de lista, lançando em caso de erro em vez de cair para []. */
export function unwrapList<T>(result: { data: T[] | null; error: SupabaseErrorLike | null }, context: string): T[] {
  assertNoError(result.error, context);
  return result.data ?? [];
}

/** Desembrulha um `maybeSingle()`, lançando em caso de erro em vez de cair para null. */
export function unwrapMaybe<T>(result: { data: T | null; error: SupabaseErrorLike | null }, context: string): T | null {
  assertNoError(result.error, context);
  return result.data;
}

/** O PostgREST devolve no máximo 1000 linhas por consulta; esta lê tudo em páginas. */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: SupabaseErrorLike | null }>,
  context: string
): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const page = unwrapList(await fetchPage(from, from + pageSize - 1), context);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
