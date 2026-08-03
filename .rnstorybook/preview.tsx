import type { Preview } from '@storybook/react-native';
import { View } from 'react-native';

import { AppThemeProvider, spacing, type ThemeMode } from '../packages/ds';
import type { DataSource } from '../src/application';

const preview: Preview = {
  globalTypes: {
    themeMode: {
      name: 'Theme',
      description: 'Light / dark theme mode',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    dataSource: {
      name: 'Data source',
      description: 'GitHub / GitLab brand primary + logo',
      toolbar: {
        icon: 'repository',
        items: [
          { value: 'github', title: 'GitHub' },
          { value: 'gitlab', title: 'GitLab' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    themeMode: 'light',
    dataSource: 'github',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: ['DS', ['Atoms', 'Molecules', 'Organisms'], '*'],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const themeMode = (context.globals.themeMode as ThemeMode) ?? 'light';
      const dataSource = (context.globals.dataSource as DataSource) ?? 'github';

      return (
        <AppThemeProvider
          key={`${themeMode}-${dataSource}`}
          initialMode={themeMode}
          initialDataSource={dataSource}>
          <View style={{ flex: 1, padding: spacing.md }}>
            <Story />
          </View>
        </AppThemeProvider>
      );
    },
  ],
};

export default preview;
