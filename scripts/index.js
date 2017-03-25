// var Module = require('module');
// var originalRequire = Module.prototype.require;

// Module.prototype.require = function(){
//   console.log(`requiring ${arguments[0]}...`);
//   return originalRequire.apply(this, arguments);
// };

const vorpal = require('vorpal')();
const chalk = require('chalk');

const {displayError, displayPackageList} = require('./commands/internal');

require('./commands/list')(vorpal);
require('./commands/select')(vorpal);
require('./commands/bump')(vorpal);
require('./commands/write')(vorpal);
require('./commands/build')(vorpal);
require('./commands/publish')(vorpal);
require('./commands/meta')(vorpal);
require('./commands/changelog')(vorpal);

displayPackageList()
  .then(() => {
    console.log();
    console.log(`Type ${chalk.cyan('help')} for a list of commands.`);
    console.log();
    vorpal.delimiter(`[${chalk.blue('collect')}${chalk.gray('able.js')}] $`).show();
  })
  .catch(displayError);
