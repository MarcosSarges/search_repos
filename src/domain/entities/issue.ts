export type IssueLabel = {
  id: string;
  name: string;
  color: string | null;
};

export type Issue = {
  id: string;
  number: number;
  title: string;
  authorName: string;
  authorAvatarUrl: string | null;
  labels: IssueLabel[];
  createdAt: string;
  htmlUrl: string;
};
