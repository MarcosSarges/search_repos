export type LoadingIndicatorSize = 'small' | 'large';

export type LoadingToken = {
  indicatorSize: LoadingIndicatorSize;
};

/**
 * Loading variants — tokens map to ActivityIndicator sizes; Loading atom only selects `variant`.
 */
export const loading = {
  sm: { indicatorSize: 'small' },
  lg: { indicatorSize: 'large' },
} as const satisfies Record<string, LoadingToken>;

export type LoadingVariant = keyof typeof loading;
