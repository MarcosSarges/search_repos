import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // JSDOM defaults to the `browser` export condition; MSW's `msw/node` needs Node resolution.
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^@ds/(.+)\\.svg$': '<rootDir>/src/test/__mocks__/svgMock.js',
    '^@/(.+)\\.svg$': '<rootDir>/src/test/__mocks__/svgMock.js',
    '\\.svg$': '<rootDir>/src/test/__mocks__/svgMock.js',
    '^@ds$': '<rootDir>/packages/ds/index.ts',
    '^@ds/(.*)$': '<rootDir>/packages/ds/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Extend jest-expo allowlist so pnpm-nested MSW deps (until-async) are transformed.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|msw|@mswjs|until-async))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};

export default config;
