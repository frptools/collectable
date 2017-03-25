const {notImplemented} = require('./internal');

module.exports = function(vorpal) {
  vorpal
    .command('changelog', 'Generate new CHANGELOG from git commit logs')
    .action(notImplemented);
}
