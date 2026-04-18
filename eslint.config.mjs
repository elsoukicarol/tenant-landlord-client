import expoConfig from 'eslint-config-expo/flat.js';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...expoConfig,
  {
    plugins: {
      '@tanstack/query': tanstackQueryPlugin,
    },
    rules: {
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'react/no-unescaped-entities': 'off',
    },
  },
  prettier,
  {
    ignores: [
      'node_modules',
      '.expo',
      'dist',
      'build',
      'coverage',
      'src/api/types.generated.ts',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];
