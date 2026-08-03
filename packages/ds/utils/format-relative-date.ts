type RelativeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

const DIVISIONS: readonly { amount: number; unit: RelativeUnit }[] = [
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

type LocaleId = 'pt-BR' | 'en';

function resolveLocale(locale: string): LocaleId {
  const normalized = locale.toLowerCase();
  if (normalized === 'en' || normalized.startsWith('en-')) {
    return 'en';
  }
  return 'pt-BR';
}

/** Hermes does not ship `Intl.RelativeTimeFormat` — format without Intl. */
function formatUnit(locale: LocaleId, value: number, unit: RelativeUnit): string {
  const abs = Math.abs(value);
  const past = value <= 0;

  if (locale === 'en') {
    if (unit === 'day' && abs === 1) {
      return past ? 'yesterday' : 'tomorrow';
    }
    if (abs === 0 && unit === 'second') {
      return 'now';
    }
    const label = abs === 1 ? unit : `${unit}s`;
    return past ? `${abs} ${label} ago` : `in ${abs} ${label}`;
  }

  // pt-BR
  if (unit === 'day' && abs === 1) {
    return past ? 'ontem' : 'amanhã';
  }
  if (abs === 0 && unit === 'second') {
    return 'agora';
  }

  const singular: Record<RelativeUnit, string> = {
    second: 'segundo',
    minute: 'minuto',
    hour: 'hora',
    day: 'dia',
    week: 'semana',
    month: 'mês',
    year: 'ano',
  };
  const plural: Record<RelativeUnit, string> = {
    second: 'segundos',
    minute: 'minutos',
    hour: 'horas',
    day: 'dias',
    week: 'semanas',
    month: 'meses',
    year: 'anos',
  };
  const noun = abs === 1 ? singular[unit] : plural[unit];
  return past ? `há ${abs} ${noun}` : `em ${abs} ${noun}`;
}

/**
 * Formats an ISO date as a relative time string (default locale `pt-BR`).
 * Invalid or empty input returns an em dash.
 *
 * Implemented without `Intl.RelativeTimeFormat` — unsupported on Hermes/RN.
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
  const locale = resolveLocale(options.locale ?? 'pt-BR');

  let duration = (date.getTime() - now.getTime()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatUnit(locale, Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return '—';
}
