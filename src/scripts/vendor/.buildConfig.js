const commonConfig = require('../../.commonConfig.js');

const {preserveComment} = commonConfig;


module.exports = {
  rollup: {
    main: {
      context: 'window',  // 'this'
    },
    bundle: {
      format: 'iife',
    },
  },
  babel: [{
    presets: [['babili', {
      simplify: false,  // to preserve comments
    }]],
    shouldPrintComment: preserveComment,
  }],
};
