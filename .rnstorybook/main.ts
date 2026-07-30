import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: [
    './stories/**/*.stories.?(ts|tsx|js|jsx)',
    '../src/components/ds/**/*.stories.?(ts|tsx|js|jsx)', // paths relative to this file
  ],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
