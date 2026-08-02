import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Text as RNText } from 'react-native';
import * as React from 'react';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  waitFor,
} from '@testing-library/react-native';

import type { Repo } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';
import { act, screen } from '@/test/render';

import { setAppContainerTestRepository, useAppContainer } from '../use-app-container';

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

function seedReadySession() {
  useSessionPreferencesStore.setState({
    dataSource: 'github',
    tokens: {},
    hasHydrated: true,
    hasTokensHydrated: true,
  });
}

describe('useAppContainer (Zustand-derived DI, no Context)', () => {
  beforeEach(() => {
    seedReadySession();
    setAppContainerTestRepository(undefined);
  });

  afterEach(() => {
    setAppContainerTestRepository(undefined);
  });

  it('creates a container from session dataSource and tokens', async () => {
    setAppContainerTestRepository(createInMemoryRepoRepository([sampleRepo]));

    const { result } = await rtlRenderHook(() => useAppContainer());

    await expect(
      result.current.container.getRepoDetails({ repoId: 'facebook/react' }),
    ).resolves.toMatchObject({ id: 'facebook/react' });
    expect(result.current.dataSource).toBe('github');
  });

  it('exposes a new container instance when dataSource changes', async () => {
    setAppContainerTestRepository(createInMemoryRepoRepository([sampleRepo]));

    const { result } = await rtlRenderHook(() => useAppContainer());

    const first = result.current.container;
    await act(async () => {
      useSessionPreferencesStore.getState().setDataSource('gitlab');
    });

    await waitFor(() => {
      expect(result.current.container).not.toBe(first);
      expect(result.current.dataSource).toBe('gitlab');
    });
  });

  it('exposes a new container instance when tokens change', async () => {
    setAppContainerTestRepository(createInMemoryRepoRepository([sampleRepo]));

    const { result } = await rtlRenderHook(() => useAppContainer());

    const first = result.current.container;
    await act(async () => {
      useSessionPreferencesStore.getState().setToken('github', 'secret-token');
    });

    await waitFor(() => {
      expect(result.current.container).not.toBe(first);
    });
  });

  it('forwards optional test repository for Fake injection', async () => {
    setAppContainerTestRepository(createInMemoryRepoRepository([sampleRepo]));

    function ProbeRepoId() {
      const { container } = useAppContainer();
      const [label, setLabel] = React.useState('loading');

      React.useEffect(() => {
        void container.getRepoDetails({ repoId: 'facebook/react' }).then((repo) => {
          setLabel(repo.id);
        });
      }, [container]);

      return <RNText>{label}</RNText>;
    }

    await rtlRender(<ProbeRepoId />);

    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeTruthy();
    });
  });

  it('creates a container with empty tokens (anonymous path)', async () => {
    useSessionPreferencesStore.setState({ tokens: {} });
    setAppContainerTestRepository(createInMemoryRepoRepository([sampleRepo]));

    const { result } = await rtlRenderHook(() => useAppContainer());

    expect(result.current.container).toBeTruthy();
    await expect(
      result.current.container.getRepoDetails({ repoId: 'facebook/react' }),
    ).resolves.toMatchObject({ id: 'facebook/react' });
  });

  it('hook source does not use React Context', () => {
    const source = readFileSync(join(__dirname, '..', 'use-app-container.ts'), 'utf8');
    expect(source).not.toMatch(/createContext|useContext|Context\.Provider/);
    expect(source).toMatch(/createContainer/);
    expect(source).toMatch(/useSessionPreferencesStore/);
  });
});
