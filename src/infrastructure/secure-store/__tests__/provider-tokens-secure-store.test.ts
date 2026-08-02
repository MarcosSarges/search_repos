import * as SecureStore from 'expo-secure-store';

import {
  clearProviderTokens,
  loadProviderTokens,
  PROVIDER_TOKEN_KEYS,
  saveProviderToken,
} from '../provider-tokens-secure-store';

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

/**
 * PRES-05d, PRES-05f, PRES-05g: SecureStore adapter for ProviderTokens.
 */
describe('provider-tokens SecureStore adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSecureStore.isAvailableAsync.mockResolvedValue(true);
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    mockedSecureStore.setItemAsync.mockResolvedValue(undefined);
    mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);
  });

  it('WHEN SecureStore has github and gitlab tokens THEN loadProviderTokens returns both', async () => {
    mockedSecureStore.getItemAsync.mockImplementation(async (key) => {
      if (key === PROVIDER_TOKEN_KEYS.github) return 'gh-token';
      if (key === PROVIDER_TOKEN_KEYS.gitlab) return 'gl-token';
      return null;
    });

    await expect(loadProviderTokens()).resolves.toEqual({
      github: 'gh-token',
      gitlab: 'gl-token',
    });
  });

  it('WHEN saveProviderToken is called with a non-empty value THEN it writes that key to SecureStore', async () => {
    await saveProviderToken('github', 'gh-secret');

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      PROVIDER_TOKEN_KEYS.github,
      'gh-secret',
    );
    expect(mockedSecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('WHEN saveProviderToken is called with empty or undefined THEN it deletes the SecureStore key', async () => {
    await saveProviderToken('gitlab', '');
    await saveProviderToken('github', undefined);

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(PROVIDER_TOKEN_KEYS.gitlab);
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(PROVIDER_TOKEN_KEYS.github);
    expect(mockedSecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('WHEN clearProviderTokens runs THEN it deletes github and gitlab keys', async () => {
    await clearProviderTokens();

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(PROVIDER_TOKEN_KEYS.github);
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(PROVIDER_TOKEN_KEYS.gitlab);
  });

  it('WHEN SecureStore is unavailable THEN load returns {} and writes are no-ops without throw', async () => {
    mockedSecureStore.isAvailableAsync.mockResolvedValue(false);

    await expect(loadProviderTokens()).resolves.toEqual({});
    await expect(saveProviderToken('github', 'secret')).resolves.toBeUndefined();
    await expect(clearProviderTokens()).resolves.toBeUndefined();

    expect(mockedSecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(mockedSecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(mockedSecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('WHEN SecureStore native ops reject THEN adapter swallows errors and does not throw', async () => {
    mockedSecureStore.getItemAsync.mockRejectedValue(new Error('read failed'));
    mockedSecureStore.setItemAsync.mockRejectedValue(new Error('write failed'));
    mockedSecureStore.deleteItemAsync.mockRejectedValue(new Error('delete failed'));

    await expect(loadProviderTokens()).resolves.toEqual({});
    await expect(saveProviderToken('github', 'secret')).resolves.toBeUndefined();
    await expect(clearProviderTokens()).resolves.toBeUndefined();
  });
});
