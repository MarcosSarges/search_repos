import * as fs from 'fs';
import * as path from 'path';

/**
 * DOM-12: domain source must not import UI/HTTP/storage/query frameworks.
 * Scans `from '…'` / `from "…"` (and bare `import '…'`) under src/domain, excluding tests.
 */
const FORBIDDEN_IMPORT_SUBSTRINGS = [
  'react',
  'react-native',
  'expo',
  'axios',
  'async-storage',
  '@tanstack',
  'zustand',
  'styled-components',
] as const;

const IMPORT_SPECIFIER_RE = /(?:from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"])/gm;

function listDomainSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        continue;
      }
      files.push(...listDomainSourceFiles(fullPath));
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

describe('domain isolation (DOM-12)', () => {
  it('WHEN domain sources are scanned THEN they SHALL NOT import forbidden frameworks', () => {
    const domainRoot = path.join(__dirname, '..');
    const sourceFiles = listDomainSourceFiles(domainRoot);

    expect(sourceFiles.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      IMPORT_SPECIFIER_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = IMPORT_SPECIFIER_RE.exec(content)) !== null) {
        const specifier = match[1] ?? match[2] ?? '';
        for (const forbidden of FORBIDDEN_IMPORT_SUBSTRINGS) {
          if (specifier.includes(forbidden)) {
            violations.push(`${path.relative(domainRoot, filePath)}: ${specifier}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
