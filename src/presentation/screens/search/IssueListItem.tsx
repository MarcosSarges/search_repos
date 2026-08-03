import { Avatar, Badge, Typography } from '@ds/atoms';
import { formatRelativeDate } from '@ds';
import { Card, Container } from '@ds/molecules';
import { Hyperlink } from '@ds/organisms';
import type { Issue } from '@/domain';

export type IssueListItemProps = {
  issue: Issue;
  /** Injected for deterministic relative dates in tests. */
  now?: Date;
};

export function IssueListItem({ issue, now }: IssueListItemProps) {
  const relativeDate = formatRelativeDate(issue.createdAt, now ? { now } : undefined);

  return (
    <Card>
      <Card.Header>
        <Hyperlink href={issue.htmlUrl} variant="heading">
          {issue.title}
        </Hyperlink>
      </Card.Header>
      <Card.Content>
        {issue.labels.length > 0 ? (
          <Container direction="row" gap="xs" wrap="wrap" testID="issue-list-item-labels">
            {issue.labels.map((label) => (
              <Badge key={label.id} swatch={label.color}>
                {label.name}
              </Badge>
            ))}
          </Container>
        ) : null}
        <Container direction="row" align="center" gap="sm">
          <Avatar uri={issue.authorAvatarUrl} name={issue.authorName} size="sm" />
          <Typography variant="caption" color="muted">
            {issue.authorName}
          </Typography>
          <Typography variant="caption" color="muted" testID="issue-list-item-date">
            {relativeDate}
          </Typography>
        </Container>
      </Card.Content>
    </Card>
  );
}
