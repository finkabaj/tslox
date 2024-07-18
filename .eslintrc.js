module.exports = {
  root: true,
  env: {
    es2023: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'max-len': ['error', { code: 80 }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/', '.eslintrc.js'],
};
