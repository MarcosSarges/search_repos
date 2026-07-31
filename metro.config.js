// Learn more https://docs.expo.io/guides/customizing-metro
const { withStorybook } = require('@storybook/react-native/withStorybook');

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

// SVG transformer must be applied on the Expo config before Storybook wraps Metro.
module.exports = withStorybook(config);
