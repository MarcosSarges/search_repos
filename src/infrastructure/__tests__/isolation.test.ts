import * as fs from 'fs';
import * as path from 'path';

/**
 * INFRA-34: HTTP adapters and shared http kit must not import UI/state frameworks.
 * Scans production sources under http/, github/, gitlab/ (excludes __tests__).
 */
const FORBIDDEN_IMPORT_SUBSTRINGS = [
  'react',
  'react-native',
  'zustand',
  '@tanstack',
  'styled-components',
] as const;

const IMPORT_SPECIFIER_RE = /(?:from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"])/gm;

const SCAN_ROOTS = ['http', 'github', 'gitlab'] as const;

function listSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        continue;
      }
      files.push(...listSourceFiles(fullPath));
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

describe('infrastructure adapter isolation (INFRA-34)', () => {
  it('WHEN http/github/gitlab sources are scanned THEN they SHALL NOT import React, Zustand, TanStack Query, or styled-components', () => {
    const infraRoot = path.join(__dirname, '..');
    const sourceFiles = SCAN_ROOTS.flatMap((subdir) =>
      listSourceFiles(path.join(infraRoot, subdir)),
    );

    expect(sourceFiles.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      IMPORT_SPECIFIER_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = IMPORT_SPECIFIER_RE.exec(content)) !== null) {
        const specifier = match[1] ?? match[2] ?? '';
        for (const forbidden of FORBIDDEN_IMPORT_SUBSTRINGS) {
          // Avoid false positive on `createAppError` etc. — match package-like import segments.
          if (
            specifier === forbidden ||
            specifier.startsWith(`${forbidden}/`) ||
            specifier.includes(`/${forbidden}`) ||
            specifier.includes(`node_modules/${forbidden}`)
          ) {
            violations.push(`${path.relative(infraRoot, filePath)}: ${specifier}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
