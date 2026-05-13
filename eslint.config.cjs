const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly', // 👈 This line fixes the error
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        console: 'readonly', 
        Buffer: 'readonly', 
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      }],
       'no-unused-vars': 'off', // disable base rule
      'prettier/prettier': 'error',
    },
  },

  {
    ignores: ['dist/', 'node_modules/'],
  },

  prettierConfig,
];