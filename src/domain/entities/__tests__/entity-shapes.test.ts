import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * DOM-02 / DOM-04 / DOM-05: lock entity and pagination contracts via source scan
 * (provider-agnostic shapes; optional fields via `?:`, not `| null`).
 */
describe('domain entity shapes (DOM-02, DOM-04, DOM-05)', () => {
  const repoSource = readFileSync(join(__dirname, '../repo.ts'), 'utf8');
  const issueSource = readFileSync(join(__dirname, '../issue.ts'), 'utf8');
  const paginationSource = readFileSync(join(__dirname, '../pagination.ts'), 'utf8');

  it('WHEN Repo / Issue sources are inspected THEN they SHALL NOT include a source field (DOM-02)', () => {
    expect(repoSource).not.toMatch(/\bsource\s*[?:]/);
    expect(issueSource).not.toMatch(/\bsource\s*[?:]/);
  });

  it('WHEN PaginatedResult is inspected THEN it SHALL include pagination fields and SHALL NOT include totalCount (DOM-04)', () => {
    expect(paginationSource).toMatch(/\bitems\s*:/);
    expect(paginationSource).toMatch(/\bpage\s*:/);
    expect(paginationSource).toMatch(/\bperPage\s*:/);
    expect(paginationSource).toMatch(/\bhasNextPage\s*:/);
    expect(paginationSource).not.toMatch(/\btotalCount\b/);
  });

  it('WHEN optional entity fields are typed THEN they SHALL use ?: / undefined, not | null (DOM-05)', () => {
    expect(repoSource).toMatch(/\bdescription\?\s*:/);
    expect(repoSource).toMatch(/\blanguage\?\s*:/);
    expect(repoSource).toMatch(/\bownerAvatarUrl\?\s*:/);
    expect(issueSource).toMatch(/\bcolor\?\s*:/);
    expect(issueSource).toMatch(/\bauthorAvatarUrl\?\s*:/);

    expect(repoSource).not.toMatch(/\|\s*null\b/);
    expect(issueSource).not.toMatch(/\|\s*null\b/);
  });
});
