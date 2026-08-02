import * as fs from 'fs';
import * as path from 'path';

/**
 * APP-07: application production sources must not import UI/HTTP/storage/query frameworks
 * or `@/infrastructure` (Dependency Rule — tests excluded).
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
  '@/infrastructure',
] as const;

const IMPORT_SPECIFIER_RE = /(?:from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"])/gm;

function listApplicationSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        continue;
      }
      files.push(...listApplicationSourceFiles(fullPath));
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

describe('application isolation (APP-07)', () => {
  it('WHEN application sources are scanned THEN they SHALL NOT import forbidden frameworks or @/infrastructure', () => {
    const applicationRoot = path.join(__dirname, '..');
    const sourceFiles = listApplicationSourceFiles(applicationRoot);

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
            violations.push(`${path.relative(applicationRoot, filePath)}: ${specifier}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
