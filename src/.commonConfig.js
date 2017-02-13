module.exports = {
  preserveComment: comment => /^!|license|copyright/i.test(comment),
  browsers: [
    'last 3 versions',
    '> 5%',
    '> 5% in JP',
    'Android >= 5',
    'iOS >= 8',
    'not Explorer <= 9',
  ],
};
