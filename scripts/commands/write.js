const {from, getState, selected, displayPackageList} = require('./internal');
const {writeManifestToDisk} = require('../lib');
const chalk = require('chalk');

module.exports = function(vorpal) {
  vorpal
    .command('write', 'Write changes to selected package.json files')
    .action(from(write));
}

function write(arg) {
  return getState()
    .then(({packages}) => selected(packages).forEach(pkg => {
      if(pkg.modified) {
        console.log(`Writing ${pkg.path} ...`);
        writeManifestToDisk(pkg);
      }
      else {
        console.log(chalk.grey(`Package.json for ${chalk.cyan(pkg.name)} has no pending changes. Skipping.`));
      }
    }))
    .then(() => {
      console.log();
      return displayPackageList();
    });
}