import {run} from '@motorcycle/run'
import {makeDomComponent} from '@motorcycle/dom';
import {App} from './core/app';

require('./core/styles.styl');
require('./data/styles.styl');

const domDriver = makeDomComponent(document.getElementById('app-root'));

function effects({view$}) {
  const {dom} = domDriver({view$});
  return {dom};
}

run(App, effects);
