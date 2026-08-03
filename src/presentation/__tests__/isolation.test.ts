import * as fs from 'fs';
import * as path from 'path';

/**
 * Explore / presentation isolation: hooks and screens must not import
 * provider ACLs or raw fetch (AD-002 / EXP Clean Arch ACs).
 */
const FORBIDDEN_IMPORT_SUBSTRINGS = [
  '@/infrastructure/github',
  '@/infrastructure/gitlab',
  'node-fetch',
] as const;

const FORBIDDEN_BARE_FETCH_RE =
  /(?:from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]|^\s*import\s*\(\s*['"]([^'"]+)['"]\s*\))/gm;

function listSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === '__mocks__') {
        continue;
      }
      files.push(...listSourceFiles(fullPath));
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) {
      continue;
    }
    if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function collectViolations(roots: string[], label: string): string[] {
  const violations: string[] = [];

  for (const root of roots) {
    const sourceFiles = listSourceFiles(root);
    expect(sourceFiles.length).toBeGreaterThan(0);

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      FORBIDDEN_BARE_FETCH_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = FORBIDDEN_BARE_FETCH_RE.exec(content)) !== null) {
        const specifier = match[1] ?? match[2] ?? match[3] ?? '';
        for (const forbidden of FORBIDDEN_IMPORT_SUBSTRINGS) {
          if (specifier.includes(forbidden)) {
            violations.push(`${label}:${path.relative(root, filePath)}: ${specifier}`);
          }
        }
      }

      // Bare global fetch usage in product hooks/screens is forbidden.
      if (/\bfetch\s*\(/.test(content)) {
        violations.push(`${label}:${path.relative(root, filePath)}: fetch(`);
      }
    }
  }

  return violations;
}

describe('presentation isolation (explore-trending)', () => {
  it('WHEN presentation sources are scanned THEN they SHALL NOT import github/gitlab ACL or call fetch', () => {
    const presentationRoot = path.join(__dirname, '..');
    const violations = collectViolations([presentationRoot], 'presentation');
    expect(violations).toEqual([]);
  });

  it('Explore hook and screen modules do not reference provider package paths', () => {
    const hookSource = fs.readFileSync(
      path.join(__dirname, '../hooks/use-list-trending-repos.ts'),
      'utf8',
    );
    const screenSource = fs.readFileSync(
      path.join(__dirname, '../screens/ExploreScreen.tsx'),
      'utf8',
    );

    for (const source of [hookSource, screenSource]) {
      expect(source).not.toMatch(/@\/infrastructure\/(github|gitlab)/);
      expect(source).not.toMatch(/\bfetch\s*\(/);
    }
  });
});
