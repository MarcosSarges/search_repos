export type ResolveHasNextPageInput = {
  itemsLength: number;
  perPage: number;
  /** Prefer when known (GitHub Link rel=next, GitLab X-Next-Page non-empty). */
  headerIndicatesNext?: boolean;
  /**
   * Caller-resolved next flag (e.g. GitHub search after applying total_count cap).
   * When defined, wins over headers/length fallback. No totalCount knowledge here.
   */
  resolvedHasNext?: boolean;
};

/**
 * Hybrid pagination: empty → false; else resolvedHasNext; else headerIndicatesNext; else length===perPage.
 */
export function resolveHasNextPage(input: ResolveHasNextPageInput): boolean {
  if (input.itemsLength === 0) {
    return false;
  }
  if (input.resolvedHasNext !== undefined) {
    return input.resolvedHasNext;
  }
  if (input.headerIndicatesNext !== undefined) {
    return input.headerIndicatesNext;
  }
  return input.itemsLength === input.perPage;
}
