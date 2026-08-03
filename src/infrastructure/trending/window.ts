/** Rolling discovery window for trending ACL queries (EXP-13 / EXP-14). */
export const TRENDING_WINDOW_DAYS = 30;

function sinceDate(now: Date): Date {
  const since = new Date(now.getTime());
  since.setUTCDate(since.getUTCDate() - TRENDING_WINDOW_DAYS);
  return since;
}

/**
 * GitHub Search qualifier date: `YYYY-MM-DD` (UTC).
 */
export function getTrendingSinceDate(now: Date = new Date()): string {
  const since = sinceDate(now);
  const yyyy = since.getUTCFullYear();
  const mm = String(since.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(since.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * GitLab `last_activity_after` timestamp: `YYYY-MM-DDTHH:MM:SSZ` (UTC).
 */
export function getTrendingSinceIso(now: Date = new Date()): string {
  const since = sinceDate(now);
  const yyyy = since.getUTCFullYear();
  const mm = String(since.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(since.getUTCDate()).padStart(2, '0');
  const hh = String(since.getUTCHours()).padStart(2, '0');
  const mi = String(since.getUTCMinutes()).padStart(2, '0');
  const ss = String(since.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}Z`;
}
