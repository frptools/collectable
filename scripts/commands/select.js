const {from, getState, prompt, displayPackageList} = require('./internal');

module.exports = function(vorpal) {
  vorpal
    .command('select', 'Choose which packages are selected')
    .alias('sel')
    .action(from(bump));
}

function bump(args) {
  const form = ['selectNames'];
  return prompt(form)
    .then(({names, vseg}) => {
      return getState().then(state => [state, names]);
    })
    .then(([{packages, cache}, names]) => {
      packages.sorted.forEach(pkg => pkg.selected = false);
      names.forEach(name => packages.map[name].selected = true);
      console.log();
      return displayPackageList();
    });
}