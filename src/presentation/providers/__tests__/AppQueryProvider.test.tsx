import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Text as RNText } from 'react-native';

import { render, screen } from '@/test/render';

import { AppQueryProvider } from '../AppQueryProvider';
import { createQueryClient } from '../create-query-client';

describe('AppQueryProvider (PRES-06)', () => {
  it('renders children and accepts an optional injected client', async () => {
    const client = createQueryClient();
    await render(
      <AppQueryProvider client={client}>
        <RNText>query-child</RNText>
      </AppQueryProvider>,
    );
    expect(screen.getByText('query-child')).toBeTruthy();
  });

  it('does not register dataSource invalidate or remove listeners', () => {
    const source = readFileSync(join(__dirname, '..', 'AppQueryProvider.tsx'), 'utf8');
    expect(source).not.toMatch(/invalidateQueries/);
    expect(source).not.toMatch(/removeQueries/);
  });
});
