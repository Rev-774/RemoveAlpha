const fs = require('fs');
const path = require('path');

const babel = require('babel-core');
const rollup = require('rollup');


module.exports = (part, dir, buildConfig, destDir, callback) => {
  const destFileName = `${part}.js`;
  const srcPath = path.posix.join(dir, 'index.js');
  const destPath = path.posix.join(destDir, destFileName);

  rollup.rollup(Object.assign({
    entry: srcPath,
  }, (buildConfig.rollup && buildConfig.rollup.main) || {})).then(bundle => {
    let result = bundle.generate(Object.assign({
      //format: 'iife',
      sourceMap: true,
      sourceMapFile: destPath,
    }, (buildConfig.rollup && buildConfig.rollup.bundle) || {}));

    (buildConfig.babel || []).forEach(config => {
      result = babel.transform(result.code, Object.assign({
        presets: ['latest'],
        ast: false,
        sourceMaps: true,
        inputSourceMap: result.map,
      }, config || {}));
    });

    result.code += `\n//# sourceMappingURL=${destFileName}.map`;

    callback(destFileName, result.code, result.map.toString());
  });
};
