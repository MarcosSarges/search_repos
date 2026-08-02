/**
 * Returns true when a GitHub-style Link header includes `rel="next"` (or `rel=next`).
 */
export function hasRelNext(linkHeader: string | null): boolean {
  if (linkHeader == null || linkHeader === '') {
    return false;
  }
  return /(?:^|,\s*)<[^>]+>;\s*rel="?next"?/i.test(linkHeader);
}
