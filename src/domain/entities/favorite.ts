export type Favorite = {
  id: string;
  /** Opaque provider identity string (e.g. "github" | "gitlab" at the application boundary). */
  source: string;
  name: string;
  fullName: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  stars: number;
  description?: string;
  language?: string;
  favoritedAt: number;
};
