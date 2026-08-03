import * as fs from 'fs';
import * as path from 'path';

import * as domain from '@/domain';

/**
 * DOM-01 / DOM-16: public barrel exports entities, port, errors, validation —
 * and MUST NOT export DataSource (DOM-01, DOM-17 relocated to application).
 */
describe('domain public API (DOM-01, DOM-16)', () => {
  it('WHEN importing from @/domain THEN public helpers are reachable from the barrel', () => {
    expect(typeof domain.createAppError).toBe('function');
    expect(typeof domain.isAppError).toBe('function');
    expect(typeof domain.normalizeSearchQuery).toBe('function');
    expect(typeof domain.assertPage).toBe('function');
    expect(typeof domain.assertPerPage).toBe('function');
  });

  it('WHEN the domain barrel is inspected THEN it SHALL NOT export DataSource', () => {
    expect(Object.prototype.hasOwnProperty.call(domain, 'DataSource')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(domain, 'isDataSource')).toBe(false);

    const barrelSource = fs.readFileSync(path.join(__dirname, '../index.ts'), 'utf8');
    expect(barrelSource).not.toMatch(/\bDataSource\b/);
    expect(barrelSource).not.toMatch(/\bisDataSource\b/);
  });

  it('WHEN the domain barrel source is inspected THEN it re-exports entities, port, errors, and validation', () => {
    const barrelSource = fs.readFileSync(path.join(__dirname, '../index.ts'), 'utf8');

    expect(barrelSource).toMatch(/\bRepo\b/);
    expect(barrelSource).toMatch(/\bIssue\b/);
    expect(barrelSource).toMatch(/\bIssueLabel\b/);
    expect(barrelSource).toMatch(/\bPaginatedResult\b/);
    expect(barrelSource).toMatch(/\bRepoRepository\b/);
    expect(barrelSource).toMatch(/\bSearchReposInput\b/);
    expect(barrelSource).toMatch(/\bListIssuesInput\b/);
    expect(barrelSource).toMatch(/\bListTrendingInput\b/);
    expect(barrelSource).toMatch(/\bAppError\b/);
    expect(barrelSource).toMatch(/\bAppErrorCode\b/);
    expect(barrelSource).toMatch(/\bcreateAppError\b/);
    expect(barrelSource).toMatch(/\bisAppError\b/);
    expect(barrelSource).toMatch(/\bnormalizeSearchQuery\b/);
    expect(barrelSource).toMatch(/\bassertPage\b/);
    expect(barrelSource).toMatch(/\bassertPerPage\b/);
  });
});
