import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '../../..');
const SCAN_ROOTS = [join(ROOT, 'packages/ds'), join(ROOT, 'src/presentation')] as const;

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '__tests__',
  '__mocks__',
  'dist',
  'coverage',
]);

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR_NAMES.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...listSourceFiles(full));
      continue;
    }
    if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') && !name.endsWith('.test.tsx')) {
      out.push(full);
    }
  }
  return out;
}

describe('DS MUI props migration (PROP-08)', () => {
  it('WHEN presentation and ds sources are scanned THEN tone= / Tone / SurfaceTone / toneColorMap are absent', () => {
    const offenders: string[] = [];
    const patterns = [
      { name: 'tone=', re: /tone=/ },
      { name: 'Tone', re: /\bTone\b/ },
      { name: 'SurfaceTone', re: /\bSurfaceTone\b/ },
      { name: 'toneColorMap', re: /\btoneColorMap\b/ },
    ] as const;

    for (const root of SCAN_ROOTS) {
      for (const file of listSourceFiles(root)) {
        const source = readFileSync(file, 'utf8');
        for (const { name, re } of patterns) {
          if (re.test(source)) {
            offenders.push(`${relative(ROOT, file)} (${name})`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('WHEN product screens need a canvas fill THEN they use Container bg="background"', () => {
    const screens = [
      'src/presentation/screens/ConfigScreen.tsx',
      'src/presentation/screens/ExploreScreen.tsx',
      'src/presentation/screens/FavoritosScreen.tsx',
      'src/presentation/screens/search/SearchReposScreen.tsx',
      'src/presentation/screens/search/RepoDetailsScreen.tsx',
      'src/presentation/screens/search/RepoIssuesScreen.tsx',
    ];

    for (const rel of screens) {
      const source = readFileSync(join(ROOT, rel), 'utf8');
      expect(source).toMatch(/<Container[^>]*bg="background"/);
      expect(source).not.toMatch(/tone=/);
    }
  });
});
