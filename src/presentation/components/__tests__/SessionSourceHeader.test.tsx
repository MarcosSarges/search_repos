import { act, fireEvent, render, screen } from '@/test';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

import { SessionSourceHeader } from '../SessionSourceHeader';

describe('SessionSourceHeader (RDI-03)', () => {
  it('WHEN mounted with github dataSource THEN brand logo reflects github', async () => {
    await render(<SessionSourceHeader title="Search" />, { dataSource: 'github' });

    expect(screen.getByText('Search')).toBeTruthy();
    expect(screen.getByTestId('ds-source-header')).toBeTruthy();
    expect(screen.getByTestId('ds-datasource-logo-github-black')).toBeTruthy();
  });

  it('WHEN mounted with gitlab dataSource THEN brand logo reflects gitlab', async () => {
    await render(<SessionSourceHeader title="Search" />, { dataSource: 'gitlab' });

    expect(screen.getByTestId('ds-datasource-logo-gitlab')).toBeTruthy();
  });

  it('WHEN trailing toggle is pressed THEN store dataSource flips github ↔ gitlab', async () => {
    await render(<SessionSourceHeader title="Search" />, { dataSource: 'github' });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('github');

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Alternar fonte de dados' }));
    });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('gitlab');
    expect(screen.getByTestId('ds-datasource-logo-gitlab')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Alternar fonte de dados' }));
    });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('github');
  });
});
