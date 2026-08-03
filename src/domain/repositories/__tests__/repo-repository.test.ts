import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * EXP-10: RepoRepository exposes listTrending with provider-agnostic input
 * (page / perPage only — no GitHub/GitLab fields).
 */
describe('RepoRepository port (EXP-10)', () => {
  const portSource = readFileSync(join(__dirname, '../repo-repository.ts'), 'utf8');

  it('WHEN the port is inspected THEN it SHALL expose listTrending and ListTrendingInput', () => {
    expect(portSource).toMatch(/\blistTrending\b/);
    expect(portSource).toMatch(/\bListTrendingInput\b/);
  });

  it('WHEN ListTrendingInput is inspected THEN it SHALL include page and optional perPage only', () => {
    expect(portSource).toMatch(/export type ListTrendingInput = \{[\s\S]*?\bpage\s*:\s*number/);
    expect(portSource).toMatch(
      /export type ListTrendingInput = \{[\s\S]*?\bperPage\?\s*:\s*number/,
    );
  });

  it('WHEN the port source is scanned THEN it SHALL NOT name providers (AD-019)', () => {
    expect(portSource).not.toMatch(/\bgithub\b/i);
    expect(portSource).not.toMatch(/\bgitlab\b/i);
    expect(portSource).not.toMatch(/\bcreated:>/);
    expect(portSource).not.toMatch(/\blast_activity_after\b/);
    expect(portSource).not.toMatch(/\bstar_count\b/);
  });
});
