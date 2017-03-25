const chalk = require('chalk');
const {from, selected, getState, prompt} = require('./internal');
const {rootDir, rebuild} = require('../lib');

module.exports = function(vorpal) {
  vorpal
    .command('build', 'Build (or rebuild) out-of-date packages')
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
          console.log(`Rebuilding ${chalk.bold.white(pkg.name)}...`);
          console.log();
          return rebuild(pkg.name);
        };
        promise = promise ? promise.then(fn) : fn();
      });
      return promise;
    });
}