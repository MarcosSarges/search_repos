import type { Preview } from '@storybook/react-native';
import { View } from 'react-native';

import { AppThemeProvider, spacing } from '../src/components/ds';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <AppThemeProvider>
        <View style={{ flex: 1, padding: spacing.md }}>
          <Story />
        </View>
      </AppThemeProvider>
    ),
  ],
};

export default preview;
