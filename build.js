const fs = require('fs');
const path = require('path');

const srcDir = 'src';
const destDir = 'docs';


const buildTargets = [];

process.argv.slice(2).forEach(arg => {
  const exclude = arg[0] === '-';
  if (arg[0] === '-' || arg[0] === '+') {
    arg = arg.substr(1);
  }
  buildTargets.push([exclude, arg]);
});



function listTargets(names) {
  const targets = buildTargets.filter(target => names.includes(target[1]));
  if (targets.length && targets.some(target => target[0] !== targets[0][0])) {
    throw new Error('Invalid argument');
  }
  return targets;
}


function needsBuild(name, targets) {
  if (!targets.length) return true;
  return targets.some(target => target[1] === name) ^ targets[0][0];
}


function writeFile(fileName, content) {
  fs.writeFile(path.join(destDir, fileName), content, err => {
    if (err) {
      throw new Error(`Cannot write ${fileName}`);
    }
    console.log(`Wrote ${fileName}`);
  });
}


fs.readdir(srcDir, (err, files) => {
  const types = files.filter(file => fs.lstatSync(path.join(srcDir, file)).isDirectory());
  const targetTypes = listTargets(types);
  types
    .filter(type => needsBuild(type, targetTypes))
    .forEach(type => {
      const typeDir = path.posix.join(srcDir, type);
      const buildStepFile = './' + path.posix.join(typeDir, '.buildStep.js');
      const buildStep = require(buildStepFile);
      fs.readdir(typeDir, (err, files) => {
        const parts = files.filter(file => fs.lstatSync(path.join(typeDir, file)).isDirectory());
        const targetParts = listTargets(parts);
        parts
          .filter(part => needsBuild(part, targetParts))
          .forEach(part => {
            const partDir = path.posix.join(typeDir, part);
            console.log(`Build ${partDir}`);

            const buildConfigFile = './' + path.posix.join(partDir, '.buildConfig.js');
            const buildConfig = fs.existsSync(buildConfigFile) ? require(buildConfigFile) : {};

            buildStep(part, partDir, buildConfig, destDir, (fileName, content, mapContent) => {
              const mapFileName = fileName + '.map';
              writeFile(fileName, content);
              writeFile(mapFileName, mapContent);
            });
          });
      });
    });
});
