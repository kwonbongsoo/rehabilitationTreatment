import type { Linter } from 'eslint';

const config: Linter.Config = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    jsx: true,
    useJSXTextNode: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint-config-prettier',
    'plugin:react/recommended',
    'next/core-web-vitals',
    'prettier',
    'plugin:jest/recommended',
    'plugin:testing-library/react',
  ],
  plugins: [
    '@typescript-eslint',
    'import',
    'prettier',
    'react',
    'react-hooks',
    'jest',
    'testing-library',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'prettier/prettier': 'error',
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    semi: 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-implicit-coercion': 'error',
    'no-undef': 'off',
    'getter-return': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'import/no-duplicates': 'error',
    'require-await': 'error',
    'no-await-in-loop': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        selector: 'variable',
        leadingUnderscore: 'allow',
      },
      { format: ['camelCase', 'PascalCase'], selector: 'function' },
      { format: ['PascalCase'], selector: 'interface' },
      { format: ['PascalCase'], selector: 'typeAlias' },
    ],
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          'public-static-field',
          'private-static-field',
          'public-instance-field',
          'private-instance-field',
          'public-constructor',
          'private-constructor',
          'public-instance-method',
          'private-instance-method',
        ],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'util',
            importNames: ['isArray'],
            message: '`Array.isArray`를 대신 사용해주세요!',
          },
        ],
      },
    ],
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.{test,spec}.{js,jsx,ts,tsx}'],
      env: { jest: true },
      rules: {
        'testing-library/prefer-screen-queries': 'error',
        'testing-library/no-debugging-utils': 'warn',
        'testing-library/no-node-access': ['error', { allowContainerFirstChild: true }],
      },
    },
  ],
};

export default config;
