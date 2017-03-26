const chalk = require('chalk');
const {from, selected, getState, prompt} = require('./internal');
const {rootDir, publishToNPM, writeCache} = require('../lib');

module.exports = function(vorpal) {
  vorpal
    .command('publish', 'Publish selected packages to NPM')
    .action(from(build));
}

function build(args) {
  return getState()
    .then(({packages, cache}) => {
      process.chdir(rootDir);
      let promise;
      selected(packages).forEach(pkg => {
        var fn = () => {
          console.log();
          console.log(`Publishing ${chalk.bold.white(pkg.name)}...`);
          console.log();
          return publishToNPM(pkg)
            .then(() => {
              const target = cache[pkg.name];
              target.version = pkg.manifest.version;
              target.lastPublished = Date.now();
              pkg.npmVersion = target.version;
              return writeCache(cache);
            });
        };
        promise = promise ? promise.then(fn) : fn();

      });
      return promise;
    });
}