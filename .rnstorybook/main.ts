import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: [
    // Primary catalog: Design System (Atomic Design)
    '../src/components/ds/**/*.stories.?(ts|tsx|js|jsx)',
  ],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
