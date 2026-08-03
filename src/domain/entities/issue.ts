export type IssueLabel = {
  id: string;
  name: string;
  color?: string;
};

export type IssueState = 'open' | 'closed';

export type Issue = {
  id: string;
  number: number;
  title: string;
  authorName: string;
  authorAvatarUrl?: string;
  labels: IssueLabel[];
  createdAt: string;
  updatedAt: string;
  state: IssueState;
  comments: number;
  htmlUrl: string;
};
