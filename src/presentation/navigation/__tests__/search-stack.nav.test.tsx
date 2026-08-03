import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NavigationContainer } from '@react-navigation/native';

import { createInMemoryRepoRepository } from '@/infrastructure';
import type { Repo } from '@/domain';
import { SearchStackNavigator } from '@/presentation/navigation/SearchStackNavigator';
import { SEARCH_DEBOUNCE_MS } from '@/presentation/constants/search';
import { act, fireEvent, render, screen, waitFor } from '@/test';

const sampleRepo: Repo = {
  id: 'facebook/react',
  name: 'react',
  fullName: 'facebook/react',
  description: 'A JavaScript library for building user interfaces',
  stars: 1000,
  forks: 200,
  watchers: 1000,
  language: 'JavaScript',
  ownerName: 'facebook',
  htmlUrl: 'https://github.com/facebook/react',
};

async function typeAndWaitForDebounce(text: string) {
  await act(async () => {
    fireEvent.changeText(screen.getByTestId('ds-input-field'), text);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50));
  });
}

describe('Search stack nav smoke (NAV-05..08, RDI-08)', () => {
  it('WHEN Search → Details → Issues THEN repoId is preserved through the stack', async () => {
    const repository = createInMemoryRepoRepository([sampleRepo]);

    await render(
      <NavigationContainer>
        <SearchStackNavigator />
      </NavigationContainer>,
      { repository, dataSource: 'github' },
    );

    await typeAndWaitForDebounce('react');

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('repo-list-item'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('repo-details-full-name')).toHaveTextContent('facebook/react');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('repo-details-issues-cta'));
    });

    await waitFor(() => {
      expect(screen.getByText('Issues')).toBeTruthy();
      expect(screen.getByTestId('repo-issues-repo-link')).toHaveTextContent('facebook/react');
    });
  });

  it('WHEN SearchStackNavigator source is inspected THEN Details and Issues hide the native header', () => {
    const source = readFileSync(join(__dirname, '../SearchStackNavigator.tsx'), 'utf8');
    expect(source).toMatch(/name="RepoDetails"[\s\S]*?headerShown:\s*false/);
    expect(source).toMatch(/name="RepoIssues"[\s\S]*?headerShown:\s*false/);
    expect(source).not.toMatch(/title:\s*'Detalhes'/);
    expect(source).not.toMatch(/title:\s*'Issues'/);
  });
});
