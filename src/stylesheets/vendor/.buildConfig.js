const commonConfig = require('../../.commonConfig.js');

const {preserveComment} = commonConfig;


module.exports = {
  cssnext: false,
  fontFamilySystemUI: false,
  cssnano: {
    comments: {
      remove: comment => !preserveComment(comment),
    },
  },
};
