import type { StyleProp, ViewStyle } from 'react-native';

import { Avatar, Badge, Divider, Icon, Typography } from '@ds/atoms';
import { Card } from '@ds/molecules';
import { toTitleCase } from '@ds/utils';

import { BadgesRow, BodyStack, MetaRow, Stat, StatsRow } from './styles';

export type RepoLanguage = {
  label: string;
  swatch?: string;
};

export type RepoItemProps = {
  name: string;
  description?: string;
  languages?: RepoLanguage[];
  ownerName: string;
  ownerAvatarUrl?: string;
  stars: number;
  forks?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Presentational repository card — Title Case name, optional description,
 * language badges + owner avatar, divider, star/fork stats.
 * Store-free; props are primitives only (no domain imports).
 */
export function RepoItem({
  name,
  description,
  languages,
  ownerName,
  ownerAvatarUrl,
  stars,
  forks,
  style,
  testID = 'ds-repo-item',
}: RepoItemProps) {
  const showDescription = Boolean(description?.trim());
  const trimmedDescription = description?.trim();
  const languageList = languages ?? [];
  const showBadges = languageList.length > 0;

  return (
    <Card testID={testID} style={style}>
      <Card.Content>
        <BodyStack>
          <Typography variant="heading" numberOfLines={2}>
            {toTitleCase(name)}
          </Typography>
          {showDescription && trimmedDescription ? (
            <Typography variant="body" color="muted" numberOfLines={3}>
              {trimmedDescription}
            </Typography>
          ) : null}
          <MetaRow>
            <BadgesRow>
              {showBadges
                ? languageList.map((lang) => (
                    <Badge key={lang.label} swatch={lang.swatch}>
                      {lang.label}
                    </Badge>
                  ))
                : null}
            </BadgesRow>
            <Avatar name={ownerName} uri={ownerAvatarUrl} size="sm" />
          </MetaRow>
        </BodyStack>
      </Card.Content>
      <Divider orientation="horizontal" />
      <Card.Footer>
        <StatsRow>
          <Stat
            accessibilityRole="text"
            accessibilityLabel={`${stars} stars`}
            testID="ds-repo-item-stars">
            <Icon name="star" size="sm" color="muted" />
            <Typography variant="caption">{String(stars)}</Typography>
          </Stat>
          {forks !== undefined ? (
            <Stat
              accessibilityRole="text"
              accessibilityLabel={`${forks} forks`}
              testID="ds-repo-item-forks">
              <Icon name="git-network" size="sm" color="muted" />
              <Typography variant="caption">{String(forks)}</Typography>
            </Stat>
          ) : null}
        </StatsRow>
      </Card.Footer>
    </Card>
  );
}
