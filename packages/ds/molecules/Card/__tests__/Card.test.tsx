import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Text } from 'react-native';

import { getTheme } from '@ds/theme';
import { cleanup, render, screen, within } from '@/test';

import {
  Card,
  type CardContentProps,
  type CardFooterProps,
  type CardHeaderProps,
  type CardProps,
} from '../Card';

describe('Card molecule (PROP-06,20)', () => {
  afterEach(() => {
    cleanup();
  });

  it('WHEN bg is omitted THEN background uses card.defaultBg surface fill', async () => {
    await render(<Card testID="card" />, { themeMode: 'light' });

    const theme = getTheme('light');
    const root = screen.getByTestId('card');
    const expectedRadius = theme.radius[theme.card.radius];

    expect(theme.card.defaultBg).toBe('surface');
    expect(root).toHaveStyleRule('background-color', theme.colors.surface);
    expect(root).toHaveStyleRule('border-color', theme.colors[theme.card.borderColorToken]);
    expect(root).toHaveStyleRule('border-top-left-radius', expectedRadius);
    expect(root).toHaveStyleRule('border-top-right-radius', expectedRadius);
    expect(root).toHaveStyleRule('border-bottom-right-radius', expectedRadius);
    expect(root).toHaveStyleRule('border-bottom-left-radius', expectedRadius);

    const cardSource = readFileSync(join(__dirname, '../Card.tsx'), 'utf8');
    expect(cardSource).not.toMatch(/Container/);
    const stylesSource = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(stylesSource).not.toMatch(/Container/);
  });

  it('WHEN bg is background THEN background overrides the card default fill', async () => {
    await render(<Card testID="card" bg="background" />, { themeMode: 'light' });

    const theme = getTheme('light');
    expect(screen.getByTestId('card')).toHaveStyleRule(
      'background-color',
      theme.colors.background,
    );
  });

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type RootHasStyle = 'style' extends keyof CardProps ? true : false;
    const rootHasStyle: RootHasStyle = true;
    expect(rootHasStyle).toBe(true);

    await render(<Card testID="card" style={{ opacity: 0.55 }} />, { themeMode: 'light' });

    expect(screen.getByTestId('card')).toHaveStyle({ opacity: 0.55 });
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
    expect(root).toHaveStyleRule('background-color', theme.colors[theme.card.defaultBg]);
  });

  it('WHEN Card compound members are inspected THEN Header Content Footer are static members', () => {
    expect(Card.Header).toBeDefined();
    expect(Card.Content).toBeDefined();
    expect(Card.Footer).toBeDefined();
  });

  it('WHEN region props are inspected THEN style is not required on Header Content Footer', () => {
    type HeaderHasStyle = 'style' extends keyof CardHeaderProps ? true : false;
    type ContentHasStyle = 'style' extends keyof CardContentProps ? true : false;
    type FooterHasStyle = 'style' extends keyof CardFooterProps ? true : false;

    // Root style is required by PROP-20; regions stay minimal unless needed
    const headerHasStyle: HeaderHasStyle = false;
    const contentHasStyle: ContentHasStyle = false;
    const footerHasStyle: FooterHasStyle = false;

    expect(headerHasStyle).toBe(false);
    expect(contentHasStyle).toBe(false);
    expect(footerHasStyle).toBe(false);
  });
});
