import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.+)\\.svg$': '<rootDir>/src/test/__mocks__/svgMock.js',
    '\\.svg$': '<rootDir>/src/test/__mocks__/svgMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
