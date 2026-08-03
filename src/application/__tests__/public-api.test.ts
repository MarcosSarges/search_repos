import * as fs from 'fs';
import * as path from 'path';

import * as application from '@/application';

/**
 * APP-13 / APP-15: application barrel exports factories + DataSource; excludes DI/Fake.
 */
describe('application public API (APP-13, APP-15)', () => {
  it('WHEN importing from @/application THEN factories, I/O types, and DataSource are reachable', () => {
    expect(typeof application.createSearchRepos).toBe('function');
    expect(typeof application.createGetRepoDetails).toBe('function');
    expect(typeof application.createListRepoIssues).toBe('function');
    expect(typeof application.createListTrendingRepos).toBe('function');
    expect(typeof application.createFavoriteFromRepo).toBe('function');
    expect(typeof application.createListFavorites).toBe('function');
    expect(typeof application.createListFavoritesBySource).toBe('function');
    expect(typeof application.createToggleFavorite).toBe('function');
    expect(typeof application.createRemoveFavorite).toBe('function');
    expect(typeof application.createIsFavorite).toBe('function');
    expect(typeof application.isDataSource).toBe('function');
    expect(application.isDataSource('github')).toBe(true);
    expect(application.isDataSource('gitlab')).toBe(true);
  });

  it('WHEN the @/application barrel is inspected THEN it SHALL NOT export DI or Fake symbols', () => {
    expect(Object.prototype.hasOwnProperty.call(application, 'createContainer')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(application, 'resolveRepository')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(application, 'createInMemoryRepoRepository')).toBe(
      false,
    );

    const barrelSource = fs.readFileSync(path.join(__dirname, '../index.ts'), 'utf8');
    expect(barrelSource).not.toMatch(/\bcreateContainer\b/);
    expect(barrelSource).not.toMatch(/\bresolveRepository\b/);
    expect(barrelSource).not.toMatch(/\bcreateInMemoryRepoRepository\b/);
    expect(barrelSource).not.toMatch(/infrastructure/);
  });

  it('WHEN the application barrel source is inspected THEN it re-exports factories and DataSource', () => {
    const barrelSource = fs.readFileSync(path.join(__dirname, '../index.ts'), 'utf8');

    expect(barrelSource).toMatch(/\bDataSource\b/);
    expect(barrelSource).toMatch(/\bisDataSource\b/);
    expect(barrelSource).toMatch(/\bcreateSearchRepos\b/);
    expect(barrelSource).toMatch(/\bcreateGetRepoDetails\b/);
    expect(barrelSource).toMatch(/\bcreateListRepoIssues\b/);
    expect(barrelSource).toMatch(/\bcreateListTrendingRepos\b/);
    expect(barrelSource).toMatch(/\bcreateFavoriteFromRepo\b/);
    expect(barrelSource).toMatch(/\bcreateListFavorites\b/);
    expect(barrelSource).toMatch(/\bcreateListFavoritesBySource\b/);
    expect(barrelSource).toMatch(/\bcreateToggleFavorite\b/);
    expect(barrelSource).toMatch(/\bcreateRemoveFavorite\b/);
    expect(barrelSource).toMatch(/\bcreateIsFavorite\b/);
    expect(barrelSource).toMatch(/\bSearchRepos\b/);
    expect(barrelSource).toMatch(/\bGetRepoDetails\b/);
    expect(barrelSource).toMatch(/\bListRepoIssues\b/);
    expect(barrelSource).toMatch(/\bListTrendingRepos\b/);
  });
});
