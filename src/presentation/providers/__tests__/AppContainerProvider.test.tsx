import * as React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Text as RNText } from 'react-native';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  waitFor,
} from '@testing-library/react-native';

import type { Repo } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';
import { act, screen } from '@/test/render';

import { AppContainerProvider, useAppContainer } from '../AppContainerProvider';

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

function withContainer(repository?: ReturnType<typeof createInMemoryRepoRepository>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <AppContainerProvider repository={repository}>{children}</AppContainerProvider>;
  };
}

describe('AppContainerProvider (PRES-01..03, PRES-05)', () => {
  beforeEach(() => {
    seedReadySession();
  });

  it('creates a container from session dataSource and tokens', async () => {
    const repository = createInMemoryRepoRepository([sampleRepo]);

    const { result } = await rtlRenderHook(() => useAppContainer(), {
      wrapper: withContainer(repository),
    });

    await expect(
      result.current.getRepoDetails({ repoId: 'facebook/react' }),
    ).resolves.toMatchObject({ id: 'facebook/react' });
  });

  it('exposes a new container instance when dataSource changes', async () => {
    const repository = createInMemoryRepoRepository([sampleRepo]);

    const { result } = await rtlRenderHook(() => useAppContainer(), {
      wrapper: withContainer(repository),
    });

    const first = result.current;
    await act(async () => {
      useSessionPreferencesStore.getState().setDataSource('gitlab');
    });

    await waitFor(() => {
      expect(result.current).not.toBe(first);
    });
  });

  it('exposes a new container instance when tokens change', async () => {
    const repository = createInMemoryRepoRepository([sampleRepo]);

    const { result } = await rtlRenderHook(() => useAppContainer(), {
      wrapper: withContainer(repository),
    });

    const first = result.current;
    await act(async () => {
      useSessionPreferencesStore.getState().setToken('github', 'secret-token');
    });

    await waitFor(() => {
      expect(result.current).not.toBe(first);
    });
  });

  it('useAppContainer throws a clear error outside the provider', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(rtlRenderHook(() => useAppContainer())).rejects.toThrow(/AppContainerProvider/);
    spy.mockRestore();
  });

  it('forwards optional repository prop for Fake injection', async () => {
    const repository = createInMemoryRepoRepository([sampleRepo]);

    await rtlRender(
      <AppContainerProvider repository={repository}>
        <ProbeRepoId />
      </AppContainerProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeTruthy();
    });
  });

  it('creates a container with empty tokens (anonymous path)', async () => {
    useSessionPreferencesStore.setState({ tokens: {} });
    const repository = createInMemoryRepoRepository([sampleRepo]);

    const { result } = await rtlRenderHook(() => useAppContainer(), {
      wrapper: withContainer(repository),
    });

    expect(result.current).toBeTruthy();
    await expect(
      result.current.getRepoDetails({ repoId: 'facebook/react' }),
    ).resolves.toMatchObject({ id: 'facebook/react' });
  });

  it('provider source does not import github/gitlab adapters or fetch', () => {
    const source = readFileSync(join(__dirname, '..', 'AppContainerProvider.tsx'), 'utf8');
    expect(source).not.toMatch(/github\/create-github|gitlab\/create-gitlab/);
    expect(source).not.toMatch(/\bfetch\b/);
    expect(source).toMatch(/createContainer/);
  });
});

function ProbeRepoId() {
  const container = useAppContainer();
  const [label, setLabel] = React.useState('loading');

  React.useEffect(() => {
    void container.getRepoDetails({ repoId: 'facebook/react' }).then((repo) => {
      setLabel(repo.id);
    });
  }, [container]);

  return <RNText>{label}</RNText>;
}
