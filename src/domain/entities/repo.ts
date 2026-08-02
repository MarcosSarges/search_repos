export type Repo = {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  stars: number;
  forks: number;
  watchers: number;
  language?: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  htmlUrl: string;
};
