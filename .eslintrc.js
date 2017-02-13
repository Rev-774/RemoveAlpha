module.exports = {
  extends: 'eslint:recommended',

  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },

  env: {
    node: true,
    browser: true,
  },

  rules: {
    'indent': ['warn', 2, {SwitchCase: 1}],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['warn', 'single', 'avoid-escape'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'only-multiline'],
    'object-curly-spacing': ['warn', 'never'],
    'eqeqeq': ['warn', 'allow-null'],
    'no-cond-assign': ['error', 'always'],
    'no-unused-vars': ['warn', {args: 'none'}],
    'no-console': 'off',
  },
};
