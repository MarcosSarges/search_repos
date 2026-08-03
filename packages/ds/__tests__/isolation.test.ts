import * as fs from 'fs';
import * as path from 'path';

/**
 * DSLIB-02: packages/ds must not import app layers.
 * Scans production TS/TSX under packages/ds (excludes __tests__ and *.test.* / *.stories.*).
 */
const FORBIDDEN_IMPORT_PREFIXES = [
  '@/application',
  '@/stores',
  '@/presentation',
  '@/domain',
  '@/infrastructure',
  '@/components',
  '@/hooks',
  '@/constants',
  '@/test',
] as const;

const IMPORT_SPECIFIER_RE = /(?:from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"])/gm;

function listSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') {
        continue;
      }
      files.push(...listSourceFiles(fullPath));
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }
    if (
      entry.name.endsWith('.test.ts') ||
      entry.name.endsWith('.test.tsx') ||
      entry.name.endsWith('.stories.tsx') ||
      entry.name.endsWith('.stories.ts')
    ) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

describe('packages/ds isolation (DSLIB-02)', () => {
  it('WHEN packages/ds sources are scanned THEN they SHALL NOT import app-layer @/ modules', () => {
    const dsRoot = path.join(__dirname, '..');
    const sourceFiles = listSourceFiles(dsRoot);

    expect(sourceFiles.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      IMPORT_SPECIFIER_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = IMPORT_SPECIFIER_RE.exec(content)) !== null) {
        const specifier = match[1] ?? match[2] ?? '';
        for (const forbidden of FORBIDDEN_IMPORT_PREFIXES) {
          if (specifier === forbidden || specifier.startsWith(`${forbidden}/`)) {
            violations.push(`${path.relative(dsRoot, filePath)}: ${specifier}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('WHEN legacy DS paths are grepped THEN src/components/ds and @/components/ds are gone', () => {
    const repoRoot = path.join(__dirname, '../../..');
    expect(fs.existsSync(path.join(repoRoot, 'src/components/ds'))).toBe(false);

    const scanRoots = [
      path.join(repoRoot, 'src'),
      path.join(repoRoot, 'packages'),
      path.join(repoRoot, '.rnstorybook'),
    ];

    const leftover: string[] = [];
    for (const root of scanRoots) {
      if (!fs.existsSync(root)) {
        continue;
      }
      for (const filePath of listSourceFiles(root)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('@/components/ds') || content.includes('src/components/ds')) {
          leftover.push(path.relative(repoRoot, filePath));
        }
      }
    }

    expect(leftover).toEqual([]);
  });

  it('WHEN Storybook preview imports the DS THEN it uses the @ds alias (DSLIB-01/12)', () => {
    const repoRoot = path.join(__dirname, '../../..');
    const preview = fs.readFileSync(path.join(repoRoot, '.rnstorybook/preview.tsx'), 'utf8');
    expect(preview).toMatch(/from ['"]@ds['"]/);
    expect(preview).not.toMatch(/from ['"]\.\.\/packages\/ds['"]/);
  });

  it('WHEN README Design System section is read THEN it documents packages/ds, @ds, and presentation bridge (DSLIB-14)', () => {
    const repoRoot = path.join(__dirname, '../../..');
    const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
    expect(readme).toMatch(/packages\/ds/);
    expect(readme).toMatch(/`@ds`/);
    expect(readme).toMatch(/presentation\/theme|AppThemeProvider/);
  });

  it('WHEN brand SVG imports are scanned THEN only DataSourceLogo organism imports them', () => {
    const dsRoot = path.join(__dirname, '..');
    const sourceFiles = listSourceFiles(dsRoot);
    const assetImporters = sourceFiles.filter((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      return /assets\/(github|gitlab)\//.test(content);
    });

    expect(assetImporters.map((f) => path.relative(dsRoot, f))).toEqual([
      path.join('organisms', 'DataSourceLogo', 'styles.tsx'),
    ]);
  });
});
