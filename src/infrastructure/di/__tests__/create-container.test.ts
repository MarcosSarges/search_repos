import * as fs from 'fs';
import * as path from 'path';

import { http, HttpResponse } from 'msw';

import type { Repo } from '@/domain';
import { server } from '@/test/msw/server';
import { useMswServer } from '@/test/msw/use-msw-server';

import { createInMemoryRepoRepository } from '../../repositories/in-memory-repo-repository';
import { createContainer } from '../create-container';

const sampleRepo: Repo = {
  id: 'facebook/react',
  name: 'react',
  fullName: 'facebook/react',
  description: 'A JavaScript library for building user interfaces',
  stars: 1000,
  forks: 200,
  watchers: 1000,
  language: 'JavaScript',
  ownerName: 'facebook',
  htmlUrl: 'https://github.com/facebook/react',
};

/**
 * INFRA-29..32: tokens bag selection; repository override; no Zustand in di/.
 */
describe('createContainer (INFRA-29, INFRA-30, INFRA-32)', () => {
  useMswServer(server);

  it('WHEN createContainer({ dataSource }) THEN it exposes callable searchRepos/getRepoDetails/listRepoIssues/listTrendingRepos', () => {
    const container = createContainer({ dataSource: 'github' });

    expect(typeof container.searchRepos).toBe('function');
    expect(typeof container.getRepoDetails).toBe('function');
    expect(typeof container.listRepoIssues).toBe('function');
    expect(typeof container.listTrendingRepos).toBe('function');
    expect(container).not.toHaveProperty('searchRepos.execute');
    expect(Object.prototype.hasOwnProperty.call(container.searchRepos, 'execute')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(container.listTrendingRepos, 'execute')).toBe(
      false,
    );
  });

  it('WHEN createContainer is called twice with different dataSource THEN containers are distinct instances', () => {
    const github = createContainer({ dataSource: 'github' });
    const gitlab = createContainer({ dataSource: 'gitlab' });

    expect(github).not.toBe(gitlab);
    expect(github.searchRepos).not.toBe(gitlab.searchRepos);
  });

  it('WHEN repository override is provided THEN wired use cases use that repository', async () => {
    const repository = createInMemoryRepoRepository([sampleRepo]);
    const container = createContainer({ dataSource: 'gitlab', repository });

    await expect(container.getRepoDetails({ repoId: 'facebook/react' })).resolves.toMatchObject({
      id: 'facebook/react',
      fullName: 'facebook/react',
    });

    const trending = await container.listTrendingRepos({ page: 1, perPage: 10 });
    expect(trending.items).toHaveLength(1);
    expect(trending.items[0]?.id).toBe('facebook/react');
  });

  it('WHEN tokens bag is given with dataSource github THEN only github token is forwarded as Bearer', async () => {
    let authorization: string | null = null;
    let privateToken: string | null = null;

    server.use(
      http.get('https://api.github.com/search/repositories', ({ request }) => {
        authorization = request.headers.get('Authorization');
        privateToken = request.headers.get('PRIVATE-TOKEN');
        return HttpResponse.json({ total_count: 0, items: [] });
      }),
    );

    const container = createContainer({
      dataSource: 'github',
      tokens: { github: 'g', gitlab: 'l' },
    });

    await container.searchRepos({ query: 'react' });

    expect(authorization).toBe('Bearer g');
    expect(privateToken).toBeNull();
  });

  it('WHEN same tokens bag with dataSource gitlab THEN only gitlab token is forwarded as PRIVATE-TOKEN', async () => {
    let authorization: string | null = null;
    let privateToken: string | null = null;

    server.use(
      http.get('https://gitlab.com/api/v4/projects', ({ request }) => {
        authorization = request.headers.get('Authorization');
        privateToken = request.headers.get('PRIVATE-TOKEN');
        return HttpResponse.json([]);
      }),
    );

    const container = createContainer({
      dataSource: 'gitlab',
      tokens: { github: 'g', gitlab: 'l' },
    });

    await container.searchRepos({ query: 'react' });

    expect(privateToken).toBe('l');
    expect(authorization).toBeNull();
  });

  it('WHEN modules under src/infrastructure/di/ are scanned THEN they SHALL NOT import Zustand or session-preferences-store', () => {
    const diRoot = path.join(__dirname, '..');
    const sourceFiles = listDiSourceFiles(diRoot);
    expect(sourceFiles.length).toBeGreaterThan(0);

    const violations: string[] = [];
    const importRe = /(?:from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"])/gm;

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      importRe.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = importRe.exec(content)) !== null) {
        const specifier = match[1] ?? match[2] ?? '';
        if (specifier.includes('zustand') || specifier.includes('session-preferences-store')) {
          violations.push(`${path.relative(diRoot, filePath)}: ${specifier}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

function listDiSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        continue;
      }
      files.push(...listDiSourceFiles(fullPath));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name.endsWith('.test.ts')) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
}
