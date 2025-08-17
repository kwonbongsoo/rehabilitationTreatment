import type { Linter } from 'eslint';

const config: Linter.Config = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint-config-prettier',
    'plugin:jest/recommended',
    'prettier',
  ],
  // @ts-expect-error: plugins should be string[]
  plugins: ['@typescript-eslint', 'import', 'prettier', 'jest'],
  rules: {
    'prettier/prettier': 'error',
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    semi: 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-implicit-coercion': 'error',
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
    '@typescript-eslint/no-var-requires': 'warn',
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
        ],
        'require-await': 'error',
        'no-await-in-loop': 'error',
        '@typescript-eslint/no-inferrable-types': 'warn',
        '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      },
    },
  ],
};

export default config;
