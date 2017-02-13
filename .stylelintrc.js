module.exports = {
  extends: 'stylelint-config-standard',

  rules: {
    'color-hex-case': 'upper',
    'color-hex-length': 'short',
    'font-family-no-duplicate-names': true,
    'number-leading-zero': 'never',
    'number-no-trailing-zeros': true,
    'length-zero-no-unit': true,
    'selector-list-comma-newline-after': 'always-multi-line',
  },
};
