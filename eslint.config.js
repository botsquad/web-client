import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ENV: 'readonly',
        React: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        // DOM types
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLAudioElement: 'readonly',
        HTMLImageElement: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Document: 'readonly',
        XMLHttpRequest: 'readonly',
        XMLHttpRequestBodyInit: 'readonly',
        // Google Maps
        google: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...prettier.rules,
      
      // Disable rules
      'semi': 'off',
      'indent': 'off',
      'arrow-body-style': 'off',
      'object-curly-newline': 'off',
      'max-len': 'off',
      'camelcase': 'off',
      'new-cap': 'off',
      'arrow-parens': 'off',
      'no-param-reassign': 'off',
      'no-continue': 'off',
      'no-loop-func': 'off',
      'no-plusplus': 'off',
      'no-underscore-dangle': 'off',
      'prefer-template': 'off',
      
      // React rules
      'react/forbit-prop-types': 'off',
      'react/jsx-filename-extension': 'off',
      'react/jsx-closing-bracket-location': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/no-danger': 'off',
      'react/prefer-stateless-function': 'off',
      'react/destructuring-assignment': 'off',
      'react/prop-types': 'off',
      'react/sort-comp': 'off',
      'react/state-in-constructor': 'off',
      'react/no-find-dom-node': 'off',
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': ['error', { args: 'after-used', varsIgnorePattern: '_' }],
    },
  },
  {
    files: ['test/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
]

