import type { DataSource } from '@/application';
import { isDataSource } from '@/application';
import type { Repo } from '@/domain';

export type FavoriteSnapshot = {
  id: string;
  dataSource: DataSource;
  name: string;
  fullName: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  stars: number;
  description?: string;
  language?: string;
  favoritedAt: number;
};

export type FavoritesPersisted = {
  items: FavoriteSnapshot[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isFavoriteSnapshot(value: unknown): value is FavoriteSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (!isNonEmptyString(record.id)) {
    return false;
  }
  if (!isDataSource(record.dataSource)) {
    return false;
  }
  if (typeof record.name !== 'string') {
    return false;
  }
  if (typeof record.fullName !== 'string') {
    return false;
  }
  if (typeof record.ownerName !== 'string') {
    return false;
  }
  if (typeof record.stars !== 'number' || Number.isNaN(record.stars)) {
    return false;
  }
  if (typeof record.favoritedAt !== 'number' || Number.isNaN(record.favoritedAt)) {
    return false;
  }
  if (!isOptionalString(record.ownerAvatarUrl)) {
    return false;
  }
  if (!isOptionalString(record.description)) {
    return false;
  }
  if (!isOptionalString(record.language)) {
    return false;
  }
  return true;
}

/** Corrupt root → `{ items: [] }`; invalid array entries dropped. */
export function sanitizePersistedFavorites(raw: unknown): FavoritesPersisted {
  if (!raw || typeof raw !== 'object') {
    return { items: [] };
  }
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.items)) {
    return { items: [] };
  }
  return {
    items: record.items.filter(isFavoriteSnapshot),
  };
}

export function toFavoriteSnapshot(repo: Repo, dataSource: DataSource): FavoriteSnapshot {
  const snapshot: FavoriteSnapshot = {
    id: repo.id,
    dataSource,
    name: repo.name,
    fullName: repo.fullName,
    ownerName: repo.ownerName,
    stars: repo.stars,
    favoritedAt: Date.now(),
  };
  if (repo.ownerAvatarUrl !== undefined) {
    snapshot.ownerAvatarUrl = repo.ownerAvatarUrl;
  }
  if (repo.description !== undefined) {
    snapshot.description = repo.description;
  }
  if (repo.language !== undefined) {
    snapshot.language = repo.language;
  }
  return snapshot;
}
