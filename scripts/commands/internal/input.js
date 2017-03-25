const inquirer = require('inquirer');
const {getState} = require('./general');

function selectNames(list) {
  return {
    type: 'checkbox',
    message: 'Select packages:',
    name: 'names',
    pageSize: 20,
    choices: list
      .filter(pkg => !(pkg.manifest.collectable||{}).skip)
      .map(pkg => ({name: pkg.name, checked: pkg.selected}))
  };
}

function selectVersionSegment() {
  return {
    type: 'list',
    message: 'Select version segment:',
    name: 'vseg',
    choices: [
      {name: 'Major: (x).x.x', value: 'major'},
      {name: 'Minor: x.(x).x', value: 'minor'},
      {name: 'Patch: x.x.(x)', value: 'patch'},
      {name: 'cancel', value: null},
    ]
  };
}

function prompt(opts) {
  return getState()
    .then(({packages}) => {
      const form = [];
      opts.forEach(opt => {
        switch(opt) {
          case 'selectNames':
            form.push(selectNames(packages.sorted));
            break;
          case 'selectVersionSegment':
            form.push(selectVersionSegment());
            break;
        }
      })
      return inquirer.prompt(form);
    });
}

module.exports = {prompt};