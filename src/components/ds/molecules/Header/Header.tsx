import type { ReactNode } from 'react';

import { Typography } from '@/components/ds/atoms';
import { DataSourceLogo } from '@/components/ds/organisms';

import { HeaderTitleSlot, StyledHeader } from './styles';

export type HeaderProps = {
  title: string;
  trailing?: ReactNode;
};

export function Header({ title, trailing }: HeaderProps) {
  return (
    <StyledHeader testID="ds-header" accessibilityRole="header">
      <DataSourceLogo size="lg" />
      <HeaderTitleSlot>
        <Typography variant="heading" size="lg">
          {title}
        </Typography>
      </HeaderTitleSlot>
      {trailing}
    </StyledHeader>
  );
}
