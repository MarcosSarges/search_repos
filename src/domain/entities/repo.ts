import type { DataSource } from './data-source';

export type Repo = {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  ownerName: string;
  ownerAvatarUrl: string | null;
  htmlUrl: string;
  source: DataSource;
};
