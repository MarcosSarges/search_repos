import type { StyleProp, ViewStyle } from 'react-native';

import { Avatar, Badge, Divider, Icon, Typography } from '@ds/atoms';
import { Card, Container } from '@ds/molecules';
import { formatRelativeDate } from '@ds/utils';

import { Hyperlink } from '../Hyperlink';

export type IssueItemLabel = {
  label: string;
  swatch?: string;
};

export type IssueItemProps = {
  number: number;
  title: string;
  titleHref: string;
  authorName: string;
  authorAvatarUrl?: string;
  labels?: IssueItemLabel[];
  state: 'open' | 'closed';
  comments: number;
  updatedAt: string;
  /** Injected for deterministic relative dates in tests/stories. */
  now?: Date;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const stateLabelByState = {
  open: 'Aberta',
  closed: 'Fechada',
} as const;

/**
 * Presentational issue card — Hyperlink title, #number + state, labels,
 * author + relative updatedAt, divider, comments footer.
 * Store-free; props are primitives only (no domain imports).
 */
export function IssueItem({
  number,
  title,
  titleHref,
  authorName,
  authorAvatarUrl,
  labels,
  state,
  comments,
  updatedAt,
  now,
  style,
  testID = 'ds-issue-item',
}: IssueItemProps) {
  const labelList = labels ?? [];
  const showLabels = labelList.length > 0;
  const relativeUpdatedAt = formatRelativeDate(updatedAt, now ? { now } : undefined);

  return (
    <Card testID={testID} style={style}>
      <Card.Content>
        <Container gap="sm">
          <Hyperlink href={titleHref} variant="heading">
            {title}
          </Hyperlink>
          <Container direction="row" align="center" gap="sm" wrap="wrap">
            <Typography variant="caption" color="muted">
              {`#${number}`}
            </Typography>
            <Badge>{stateLabelByState[state]}</Badge>
          </Container>
          {showLabels ? (
            <Container direction="row" align="center" gap="xs" wrap="wrap" testID="ds-issue-item-labels">
              {labelList.map((item) => (
                <Badge key={item.label} swatch={item.swatch}>
                  {item.label}
                </Badge>
              ))}
            </Container>
          ) : null}
          <Container direction="row" align="center" gap="sm">
            <Avatar name={authorName} uri={authorAvatarUrl} size="sm" />
            <Typography variant="caption" color="muted">
              {authorName}
            </Typography>
            <Typography variant="caption" color="muted" testID="ds-issue-item-date">
              {relativeUpdatedAt}
            </Typography>
          </Container>
        </Container>
      </Card.Content>
      <Divider orientation="horizontal" />
      <Card.Footer>
        <Container
          direction="row"
          align="center"
          gap="xs"
          testID="ds-issue-item-comments"
          accessibilityRole="text"
          accessibilityLabel={`${comments} comments`}>
          <Icon name="chatbubble-outline" size="sm" color="muted" />
          <Typography variant="caption">{String(comments)}</Typography>
        </Container>
      </Card.Footer>
    </Card>
  );
}
