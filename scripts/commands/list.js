const {from, displayPackageList} = require('./internal');

module.exports = function(vorpal) {
  vorpal
    .command('list', 'Displays the package list')
    .alias('ls')
    .action(from(displayPackageList));
}
