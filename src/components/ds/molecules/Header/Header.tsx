import type { ReactNode } from 'react';

import { Typography } from '@/components/ds/atoms';

import { HeaderTitleSlot, StyledHeader } from './styles';

export type HeaderProps = {
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Header({ title, leading, trailing }: HeaderProps) {
  return (
    <StyledHeader testID="ds-header" accessibilityRole="header">
      {leading}
      <HeaderTitleSlot>
        <Typography variant="heading">{title}</Typography>
      </HeaderTitleSlot>
      {trailing}
    </StyledHeader>
  );
}
