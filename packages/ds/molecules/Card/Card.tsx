import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'styled-components/native';

import type { SurfaceBg } from '@ds/tokens';

import { CardRegion, StyledCard } from './styles';

export type CardProps = {
  children?: ReactNode;
  bg?: SurfaceBg;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type CardHeaderProps = {
  children?: ReactNode;
};

export type CardContentProps = {
  children?: ReactNode;
};

export type CardFooterProps = {
  children?: ReactNode;
};

function CardRoot({ children, bg, style, testID = 'ds-card' }: CardProps) {
  const theme = useTheme();
  const fill = bg ?? theme.card.defaultBg;

  return (
    <StyledCard testID={testID} style={style} $bg={fill}>
      {children}
    </StyledCard>
  );
}

function CardHeader({ children }: CardHeaderProps) {
  return <CardRegion testID="ds-card-header">{children}</CardRegion>;
}

function CardContent({ children }: CardContentProps) {
  return <CardRegion testID="ds-card-content">{children}</CardRegion>;
}

function CardFooter({ children }: CardFooterProps) {
  return <CardRegion testID="ds-card-footer">{children}</CardRegion>;
}

type CardComponent = typeof CardRoot & {
  Header: typeof CardHeader;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
};

export const Card: CardComponent = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});
