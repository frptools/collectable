const {from, selected, getState, prompt, displayPackageList} = require('./internal');
const {bumpVersion, updatePackageDepVersions} = require('../lib');

module.exports = function(vorpal) {
  vorpal
    .command('bump', 'Increment package versions (major, minor or patch)')
    .action(from(bump));
}

function bump(args) {
  const form = ['selectVersionSegment'];
  return prompt(form)
    .then(({vseg}) => {
      return getState().then(state => [state, vseg]);
    })
    .then(([{packages, cache}, vseg]) => {
      console.log();
      if(vseg !== null) {
        selected(packages).forEach(pkg => {
          const oldver = pkg.version;
          pkg.manifest.version = pkg.version = bumpVersion(vseg, pkg.version);
          pkg.modified = true;
          console.log(`${pkg.name} version: ${oldver} ==> ${pkg.version}`);
        });
        updatePackageDepVersions(packages.map);
        console.log();
        return displayPackageList();
      }
    });
}