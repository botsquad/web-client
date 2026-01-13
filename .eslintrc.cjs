module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  overrides: [
    // general JS
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-unused-vars': ['error', { args: 'after-used', varsIgnorePattern: '_' }],
      },
    },
    // unit tests
    {
      files: ['test/**/*.js'],
      env: {
        mocha: true,
        node: true,
      },
    },
    // build config files
    {
      files: ['*.config.js', '*.config.cjs', '.eslintrc.cjs'],
      env: {
        node: true,
      },
    },
  ],
  globals: {
    ENV: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
    amd: true,
  },
  settings: {
    'react': {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.gql'],
    },
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
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
    'import/order': 'off',
    'class-methods-use-this': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'prefer-template': 'off',

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

    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
