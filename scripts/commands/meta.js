const {notImplemented} = require('./internal');

module.exports = function(vorpal) {
  vorpal
    .command('meta', 'Extract/update API metadata')
    .action(notImplemented);
}
