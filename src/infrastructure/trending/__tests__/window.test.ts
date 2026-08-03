import {
  TRENDING_WINDOW_DAYS,
  getTrendingSinceDate,
  getTrendingSinceIso,
} from '../window';

/**
 * EXP-13 / EXP-14 enabler: 30-day window formats for GitHub and GitLab ACL.
 */
describe('trending window helpers', () => {
  const fixedNow = new Date('2026-08-03T15:30:45.000Z');

  it('exposes a 30-day trending window', () => {
    expect(TRENDING_WINDOW_DAYS).toBe(30);
  });

  it('WHEN getTrendingSinceDate is called THEN it returns YYYY-MM-DD 30 days before now (UTC)', () => {
    expect(getTrendingSinceDate(fixedNow)).toBe('2026-07-04');
  });

  it('WHEN getTrendingSinceIso is called THEN it returns ISO Z 30 days before now', () => {
    expect(getTrendingSinceIso(fixedNow)).toBe('2026-07-04T15:30:45Z');
  });
});
