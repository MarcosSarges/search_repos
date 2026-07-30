const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

const prettierOptions = require('./.prettierrc.json');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
    rules: {
      'prettier/prettier': ['error', prettierOptions],
    },
  },
]);
