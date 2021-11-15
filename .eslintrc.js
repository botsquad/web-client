module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
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
      files: ['*.config.js', '.eslintrc.js'],
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
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  env: {
    browser: true,
    es6: true,
    amd: true,
  },
  settings: {
    'react': {
      version: '16.8',
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
  plugins: ['@typescript-eslint'],
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

    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
