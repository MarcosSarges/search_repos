import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
