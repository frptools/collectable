const inquirer = require('inquirer');
const format = require('string-format');
const chalk = require('chalk');

const {init, preparePackageList, ensureCache, formatList, compareVersions} = require('../../lib');

function displayError(err) {
  console.log();
  console.error(err);
  console.log();
}

function finish(cb) {
  return () => cb();
}

const getState = (function() {
  let state;
  return function() {
    if(!state) {
      const packages = preparePackageList();
      state = ensureCache(packages)
        .then(cache => {
          return {packages, cache};
        });
    }
    return state;
  };
})();

function selected(packages) {
  return packages.sorted.filter(pkg => pkg.selected && !pkg.skip);
}

function versionOf(item) {
  return item && item.version || '0.0.0';
}

function displayPackageList() {
  return getState()
    .then(({packages, cache}) => {
      const select = ({name, version}) => {
        const pkg = packages.map[name];
        const cached = versionOf(cache[name]);
        const compared = compareVersions(cached, version);
        const verified = compared === 0;
        const {tag, skip, selected, modified} = pkg;
        return {
          tag,
          name,
          version,
          cached,
          compared,
          verified,
          selected,
          modified,
          skip
        };
      };
      const transform = (key, value, data) => {
        var colorfn;
        switch(key) {
          case 'selected':
            value = data.skip ? '   ' : data.selected ? chalk.bold.green('[\u2717]') : chalk.gray('[ ]');
            break;
          case 'tag':
            value = data.skip ? chalk.grey(`[${value}]`) : chalk.magenta(`[${chalk.bold.magenta(value)}]`);
            break;
          case 'cached':
          case 'version':
            if(data.skip) {
              value = chalk.grey(value);
            }
            else if(data.compared < 0) {
              value = (key === 'cached' ? chalk.bold.red : chalk.bold.green)(value);
            }
            break;
          case 'name':
            colorfn = data.skip ? chalk.grey : data.verified ? chalk.bold.white : chalk.bold.yellow;
            value = colorfn(value);
            break;
          case 'verified':
            colorfn = data.skip ? chalk.gray : data.verified ? chalk.bold.green : chalk.bold.red;
            value = colorfn(data.skip ? '\u00B7' : data.verified ? '\u2713' : '\u2717');
            break;
          case 'modified':
            colorfn = data.skip ? chalk.grey : data.modified ? chalk.red : chalk.green;
            value = colorfn(data.modified ? 'UNSAVED' : 'SAVED');
            break;
        }
        return value;
      };
      formatList(`{selected}  {tag}  {name}  {version}  {cached}  {verified}  ${chalk.grey('|')}  {modified}`, packages.sorted, select, transform)
        .forEach(item => {
          const text = item.data.skip ? chalk.gray(item.formatted) : item.formatted;
          console.log(text);
        });
    });
}

function from(fn) {
  return function(args, cb) {
    console.log();
    fn(args)
      .catch(err => console.error(err))
      .then(() => {
        console.log();
        cb();
      });
  };
}

function notImplemented(arg, cb) {
  console.log();
  console.log(chalk.red('Not implemented'));
  console.log();
  cb();
}

module.exports = {
  from,
  displayError,
  finish,
  getState,
  displayPackageList,
  notImplemented,
  selected
};