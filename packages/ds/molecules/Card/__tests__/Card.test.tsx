import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Text } from 'react-native';

import { getTheme } from '@/components/ds/theme';
import { cleanup, render, screen, within } from '@/test';

import {
  Card,
  type CardContentProps,
  type CardFooterProps,
  type CardHeaderProps,
  type CardProps,
} from '../Card';

describe('Card molecule (CTRL-04)', () => {
  afterEach(() => {
    cleanup();
  });

  it('WHEN rendered THEN surface radius and border come from card tokens (not Container)', async () => {
    await render(<Card testID="card" />, { themeMode: 'light' });

    const theme = getTheme('light');
    const root = screen.getByTestId('card');
    const expectedRadius = theme.radius[theme.card.radius];

    expect(root).toHaveStyleRule('background-color', theme.colors[theme.card.surfaceTone]);
    expect(root).toHaveStyleRule('border-color', theme.colors[theme.card.borderColorToken]);
    // css-to-react-native expands border-radius into corner radii
    expect(root).toHaveStyleRule('border-top-left-radius', expectedRadius);
    expect(root).toHaveStyleRule('border-top-right-radius', expectedRadius);
    expect(root).toHaveStyleRule('border-bottom-right-radius', expectedRadius);
    expect(root).toHaveStyleRule('border-bottom-left-radius', expectedRadius);

    const cardSource = readFileSync(join(__dirname, '../Card.tsx'), 'utf8');
    expect(cardSource).not.toMatch(/Container/);
    const stylesSource = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(stylesSource).not.toMatch(/Container/);
  });

  it('WHEN Header Content and Footer are used THEN they render in header→content→footer order', async () => {
    await render(
      <Card testID="card">
        <Card.Header>
          <Text>Header</Text>
        </Card.Header>
        <Card.Content>
          <Text>Content</Text>
        </Card.Content>
        <Card.Footer>
          <Text>Footer</Text>
        </Card.Footer>
      </Card>,
    );

    const card = screen.getByTestId('card');
    expect(within(card).getByTestId('ds-card-header')).toBeTruthy();
    expect(within(card).getByTestId('ds-card-content')).toBeTruthy();
    expect(within(card).getByTestId('ds-card-footer')).toBeTruthy();
    expect(card).toHaveTextContent('HeaderContentFooter');
  });

  it('WHEN only a subset of regions is used THEN only provided regions render', async () => {
    await render(
      <Card>
        <Card.Content>
          <Text>Only content</Text>
        </Card.Content>
      </Card>,
    );

    expect(screen.getByTestId('ds-card-content')).toBeTruthy();
    expect(screen.getByText('Only content')).toBeTruthy();
    expect(screen.queryByTestId('ds-card-header')).toBeNull();
    expect(screen.queryByTestId('ds-card-footer')).toBeNull();
  });

  it('WHEN Card has zero region children THEN it still renders the chrome shell', async () => {
    await render(<Card testID="empty-card" />, { themeMode: 'light' });

    const theme = getTheme('light');
    const root = screen.getByTestId('empty-card');
    expect(root).toBeTruthy();
    expect(root).toHaveStyleRule('background-color', theme.colors[theme.card.surfaceTone]);
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type RootHasStyle = 'style' extends keyof CardProps ? true : false;
    type HeaderHasStyle = 'style' extends keyof CardHeaderProps ? true : false;
    type ContentHasStyle = 'style' extends keyof CardContentProps ? true : false;
    type FooterHasStyle = 'style' extends keyof CardFooterProps ? true : false;

    const rootHasStyle: RootHasStyle = false;
    const headerHasStyle: HeaderHasStyle = false;
    const contentHasStyle: ContentHasStyle = false;
    const footerHasStyle: FooterHasStyle = false;

    expect(rootHasStyle).toBe(false);
    expect(headerHasStyle).toBe(false);
    expect(contentHasStyle).toBe(false);
    expect(footerHasStyle).toBe(false);
  });

  it('WHEN Card compound members are inspected THEN Header Content Footer are static members', () => {
    expect(Card.Header).toBeDefined();
    expect(Card.Content).toBeDefined();
    expect(Card.Footer).toBeDefined();
  });
});
