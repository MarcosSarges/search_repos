import { useTheme as useStyledTheme } from 'styled-components/native';

import type { AppTheme } from './theme';

export function useTheme(): AppTheme {
  return useStyledTheme();
}
