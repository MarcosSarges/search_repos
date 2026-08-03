export type LoadingIndicatorSize = 'small' | 'large';

export type LoadingToken = {
  indicatorSize: LoadingIndicatorSize;
};

/**
 * Loading sizes — tokens map to ActivityIndicator sizes; Loading atom selects `size`.
 */
export const loading = {
  sm: { indicatorSize: 'small' },
  lg: { indicatorSize: 'large' },
} as const satisfies Record<string, LoadingToken>;

export type LoadingSize = keyof typeof loading;
