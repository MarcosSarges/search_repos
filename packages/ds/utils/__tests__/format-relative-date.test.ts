import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { formatRelativeDate } from '../format-relative-date';
import * as utils from '../index';
import * as ds from '../../index';

describe('formatRelativeDate (RDI-06)', () => {
  const now = new Date('2024-06-15T12:00:00.000Z');

  it('WHEN input is empty THEN returns em dash', () => {
    expect(formatRelativeDate('', { now })).toBe('—');
  });

  it('WHEN input is invalid THEN returns em dash', () => {
    expect(formatRelativeDate('not-a-date', { now })).toBe('—');
  });

  it('WHEN date is one day before now THEN returns PT-BR relative day', () => {
    const result = formatRelativeDate('2024-06-14T12:00:00.000Z', { now });
    expect(result).toMatch(/ontem|1 dia atrás|há 1 dia/i);
  });

  it('WHEN date is seconds before now THEN returns PT-BR relative seconds or now', () => {
    const result = formatRelativeDate('2024-06-15T11:59:30.000Z', { now });
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe('—');
  });

  it('WHEN date is years before now THEN returns PT-BR relative years', () => {
    const result = formatRelativeDate('2022-06-15T12:00:00.000Z', { now });
    expect(result).toMatch(/ano/i);
  });

  it('WHEN locale is overridden THEN formats with that locale', () => {
    const result = formatRelativeDate('2024-06-14T12:00:00.000Z', {
      now,
      locale: 'en',
    });
    expect(result).toMatch(/yesterday|day ago/i);
  });

  it('WHEN utils barrel is inspected THEN formatRelativeDate is exported', () => {
    expect(utils.formatRelativeDate).toBe(formatRelativeDate);
  });

  it('WHEN DS root barrel is inspected THEN formatRelativeDate is exported', () => {
    expect(ds.formatRelativeDate).toBe(formatRelativeDate);
  });

  it('WHEN util source is inspected THEN it has no @/ app imports', () => {
    const source = readFileSync(join(__dirname, '../format-relative-date.ts'), 'utf8');
    expect(source).not.toMatch(/from ['"]@\//);
  });
});
