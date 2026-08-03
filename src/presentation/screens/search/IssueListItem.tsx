import { IssueItem } from '@ds/organisms';
import type { Issue } from '@/domain';

export type IssueListItemProps = {
  issue: Issue;
  /** Injected for deterministic relative dates in tests. */
  now?: Date;
};

/** Thin adapter: maps domain `Issue` → DS `IssueItem` primitives. */
export function IssueListItem({ issue, now }: IssueListItemProps) {
  return (
    <IssueItem
      number={issue.number}
      title={issue.title}
      titleHref={issue.htmlUrl}
      authorName={issue.authorName}
      authorAvatarUrl={issue.authorAvatarUrl}
      labels={issue.labels.map((label) => ({ label: label.name, swatch: label.color }))}
      state={issue.state}
      comments={issue.comments}
      updatedAt={issue.updatedAt}
      now={now}
    />
  );
}
