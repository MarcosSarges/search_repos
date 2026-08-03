const DIVISIONS: readonly { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

export type FormatRelativeDateOptions = {
  now?: Date;
  locale?: string;
};

/**
 * Formats an ISO date as a relative time string (default locale `pt-BR`).
 * Invalid or empty input returns an em dash.
 */
export function formatRelativeDate(iso: string, options: FormatRelativeDateOptions = {}): string {
  if (!iso.trim()) {
    return '—';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const now = options.now ?? new Date();
  const locale = options.locale ?? 'pt-BR';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  let duration = (date.getTime() - now.getTime()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return '—';
}
