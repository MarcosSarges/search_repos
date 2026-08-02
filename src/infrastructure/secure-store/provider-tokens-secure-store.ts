import * as SecureStore from 'expo-secure-store';

import type { DataSource } from '@/application';

import type { ProviderTokens } from '../di/create-container';

export const PROVIDER_TOKEN_KEYS = {
  github: 'searchrepos.token.github',
  gitlab: 'searchrepos.token.gitlab',
} as const satisfies Record<DataSource, string>;

async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function loadProviderTokens(): Promise<ProviderTokens> {
  if (!(await isSecureStoreAvailable())) {
    return {};
  }

  try {
    const [github, gitlab] = await Promise.all([
      SecureStore.getItemAsync(PROVIDER_TOKEN_KEYS.github),
      SecureStore.getItemAsync(PROVIDER_TOKEN_KEYS.gitlab),
    ]);

    const tokens: ProviderTokens = {};
    if (github) {
      tokens.github = github;
    }
    if (gitlab) {
      tokens.gitlab = gitlab;
    }
    return tokens;
  } catch {
    return {};
  }
}

export async function saveProviderToken(
  dataSource: DataSource,
  token: string | undefined,
): Promise<void> {
  if (!(await isSecureStoreAvailable())) {
    return;
  }

  const key = PROVIDER_TOKEN_KEYS[dataSource];
  try {
    if (token === undefined || token === '') {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    await SecureStore.setItemAsync(key, token);
  } catch {
    // Fail closed for this write — do not crash the app.
  }
}

export async function clearProviderTokens(): Promise<void> {
  if (!(await isSecureStoreAvailable())) {
    return;
  }

  try {
    await Promise.all([
      SecureStore.deleteItemAsync(PROVIDER_TOKEN_KEYS.github),
      SecureStore.deleteItemAsync(PROVIDER_TOKEN_KEYS.gitlab),
    ]);
  } catch {
    // Swallow native clear failures.
  }
}
