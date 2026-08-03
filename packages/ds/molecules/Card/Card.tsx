import type { ReactNode } from 'react';

import { CardRegion, StyledCard } from './styles';

export type CardProps = {
  children?: ReactNode;
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

function CardRoot({ children, testID = 'ds-card' }: CardProps) {
  return <StyledCard testID={testID}>{children}</StyledCard>;
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
