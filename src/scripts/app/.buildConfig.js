const commonConfig = require('../../.commonConfig.js');

const {browsers} = commonConfig;


module.exports = {
  rollup: {
    main: {},
    bundle: {
      format: 'iife',
    },
  },
  babel: [{
    presets: [
      ['env', {
        targets: {
          browsers,
        },
        modules: false,
        loose: true,
        useBuiltIns: true,
      }],
      'babili',
    ],
    comments: false,
  }],
};
