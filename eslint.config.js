const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

const prettierOptions = require('./.prettierrc.json');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
    // Later expo flat configs replace import/resolver with node-only and drop
    // typescript path aliases — re-enable so `@ds/*` / `@/*` resolve.
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
        },
      },
    },
    rules: {
      'prettier/prettier': ['error', prettierOptions],
    },
  },
]);
