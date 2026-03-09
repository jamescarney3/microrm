const path = require('path');

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['~', path.resolve(__dirname, './src')],
          ['test', path.resolve(__dirname, './test')],
        ],
        extensions: ['.js', '.ts', '.d.ts'],
      },
    },
  },
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
  parser: '@typescript-eslint/parser',
  rules: {
    'max-len': ['warn', 120],
    semi: ['warn'],
    quotes: ['warn', 'single'],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'sibling', 'parent', 'index'],
      },
    ],
    'import/newline-after-import': ['error', { count: 1, exactCount: true, considerComments: true }],
  },
};
