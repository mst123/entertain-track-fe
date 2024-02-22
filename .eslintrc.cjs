/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'airbnb-base',
    '@vue/eslint-config-typescript',
    './.eslintrc-auto-import.json',
  ],
  globals: {
    API: 'readonly',
  },
  settings: {
    'import/resolver': {
      node: {
        map: [['@', './src']],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
      },
    },
  },
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': ['off'],
    'max-len': ['off'],
    'import/no-extraneous-dependencies': ['off'],
    'import/no-unresolved': ['off'], // TODO 解决不了 先禁用了吧
    'import/extensions': ['off'],
  },
};
