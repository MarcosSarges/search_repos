import * as fs from 'fs';
import * as path from 'path';

import * as presentation from '@/presentation';

/**
 * PRES-11 / PRES-19: product hooks must not import github/gitlab adapters or call fetch.
 * PRES-04 (related): di isolation remains covered in infrastructure di tests.
 */
const FORBIDDEN_IMPORT_SUBSTRINGS = [
  '@/infrastructure/github',
  '@/infrastructure/gitlab',
  'github/',
  'gitlab/',
] as const;

const IMPORT_SPECIFIER_RE = /(?:from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"])/gm;
const FETCH_CALL_RE = /\bfetch\s*\(/;

function listHookSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        continue;
      }
      files.push(...listHookSourceFiles(fullPath));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.ts')) {
      continue;
    }
    if (entry.name.endsWith('.test.ts')) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

describe('presentation barrel', () => {
  it('exports providers, hooks, queryKeys, and mapper', () => {
    expect(presentation.queryKeys).toBeDefined();
    expect(typeof presentation.mapAppErrorToMessage).toBe('function');
    expect(typeof presentation.AppQueryProvider).toBe('function');
    expect(typeof presentation.createQueryClient).toBe('function');
    expect(typeof presentation.AppContainerProvider).toBe('function');
    expect(typeof presentation.useAppContainer).toBe('function');
    expect(typeof presentation.useSearchRepos).toBe('function');
    expect(typeof presentation.useRepoDetails).toBe('function');
    expect(typeof presentation.useRepoIssues).toBe('function');
  });
});

describe('presentation hooks isolation (PRES-11)', () => {
  it('WHEN product hooks are scanned THEN they SHALL NOT import github/gitlab paths or call fetch', () => {
    const hooksRoot = path.join(__dirname, '../hooks');
    const sourceFiles = listHookSourceFiles(hooksRoot);

    expect(sourceFiles.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relative = path.relative(hooksRoot, filePath);

      IMPORT_SPECIFIER_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = IMPORT_SPECIFIER_RE.exec(content)) !== null) {
        const specifier = match[1] ?? match[2] ?? '';
        for (const forbidden of FORBIDDEN_IMPORT_SUBSTRINGS) {
          if (specifier.includes(forbidden)) {
            violations.push(`${relative}: import ${specifier}`);
          }
        }
      }

      if (FETCH_CALL_RE.test(content)) {
        violations.push(`${relative}: fetch(`);
      }
    }

    expect(violations).toEqual([]);
  });
});
