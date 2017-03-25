const execa = require('execa');
const {rootDir} = require('./core');

function publishToNPM(pkg) {
  const workingDir = process.cwd();
  process.chdir(pkg.dir);
  return execa('npm', ['publish', '--access', 'public'])
    .then(result => {
      process.chdir(workingDir);
    });
}

function getVersionFromNPM(packageName) {
  return execa('npm', ['info', packageName, '--json'])
    .then(result => {
      const manifest = JSON.parse(result.stdout);
      return manifest.version;
    })
    .catch(err => {
      if(err.stderr && err.stderr.indexOf('is not in the npm registry') !== -1) {
        return null;
      }
      throw err;
    });
}

module.exports = {
  getVersionFromNPM,
  publishToNPM
};