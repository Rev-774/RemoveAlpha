const fs = require('fs');
const path = require('path');

const postcss = require('postcss');
const plugins = {
  cssnano: require('cssnano'),
  cssnext: require('postcss-cssnext'),
  fontFamilySystemUI: require('postcss-font-family-system-ui'),
  atImport: require('postcss-import'),
};


const pluginNames = [
  'atImport',
  'cssnext',
  'fontFamilySystemUI',
  'cssnano',
];


const defaultPluginConfig = {
  atImport: {},
  cssnext: {},
  fontFamilySystemUI: {},
  cssnano: {
    autoprefixer: false,
  },
};


module.exports = (part, dir, buildConfig, destDir, callback) => {
  const destFileName = `${part}.css`;
  const srcPath = path.posix.join(dir, 'index.css');
  const destPath = path.posix.join(destDir, destFileName);

  const usedPlugins = pluginNames
    .filter(pluginName => defaultPluginConfig[pluginName] || buildConfig[pluginName])
    .map(pluginName => {
      function makeObject(object) {
        return typeof object === 'object' ? object : {};
      }
      const plugin = plugins[pluginName];
      const defaultConfig = defaultPluginConfig[pluginName];
      const userConfig = buildConfig[pluginName];
      if (typeof defaultConfig !== 'object') {
        return plugin(userConfig);
      }
      return plugin(Object.assign(defaultConfig, makeObject(userConfig)));
    });

  fs.readFile(srcPath, (err, css) => {
    if (err) {
      throw new Error(`Cannot read ${srcPath}`);
    }
    postcss(usedPlugins)
      .process(css, {
        from: srcPath,
        to: destPath,
        map: {
          inline: false,
          annotation: false,
        },
      })
      .then(result => {
        result.css += `\n/*# sourceMappingURL=${destFileName}.map */`;
        callback(destFileName, result.css, result.map.toString());
      });
  });
};
