import Immutable from 'immutable';
import {div, span, ul, li, code} from '@motorcycle/dom';
import {periodic, just, multicast, scan} from 'most';

import {VersionList} from './versions';
import {Input, getSavedValue, saveValue} from './input';
import {Navigation} from './navigation';
import {Renderer} from './renderer';

import {start} from '../data';

function updateAlignment(alignment) {
  return function(vn0, {element: el}) {
    switch(alignment) {
      case 0: el.scrollLeft = 0; break;
      case 1: el.scrollLeft = el.scrollWidth/2 - el.offsetWidth/2; break;
      case 2: el.scrollLeft = el.scrollWidth; break;
    }
  }
}

function render(state, nav, diagram) {
  const postpatch = updateAlignment(state.alignment);
  const view = div('.container', {}, [
    nav,
    div('.main', {attrs: {'data-alignment': state.alignment}, postpatch}, [
      div('.header', [
        div('.title', `${state.index + 1}. ${state.versions.get(state.index).label}`),
        div('.info', [
          ul('.instructions', [
            li([
              span('.ctl', [code('['), ' and ', code(']')]),
              span('.text', ' Horizontal scroll')
            ]),
            li([
              span('.ctl', [code({innerHTML: '&larr;'}), ' and ', code({innerHTML: '&rarr;'})]),
              span('.text', ' Previous/next version')
            ]),
            li([
              span('.ctl', [code('PGUP'), ' and ', code('PGDN')]),
              span('.text', ' Previous/next "done"')
            ]),
            li([
              span('.ctl', [code('HOME'), ' and ', code('END')]),
              span('.text', ' First/last version')
            ]),
            li([
              span('.ctl', [code('S')]),
              span('.text', ' Save selected index')
            ]),
            li([
              span('.ctl', [code('X')]),
              span('.text', ' Clear console')
            ]),
          ])
        ])
      ]),
      div('.diagram', [diagram])
    ]),
  ]);
  return view;
}

function actionFromVersions(versions) {
  return state => state.versions = versions;
}

export function App({dom}) {
  const {versions$} = VersionList({dom});
  const {action$} = Input({dom});
  const state$ = action$
    .merge(versions$.map(actionFromVersions))
    .scan((state, fn) => {
      fn(state);
      if(state.pendingIndex !== -1 && state.versions.size > state.pendingIndex) {
        state.index = state.pendingIndex;
        state.pendingIndex = -1;
      }
      return state;
    }, {
      alignment: getSavedValue('alignment'),
      zoom: getSavedValue('zoom'),
      index: 0,
      pendingIndex: getSavedValue('index', -1),
      versions: Immutable.List(),
    })
    .skip(1)
    .multicast();

  const kickstart$ = periodic(100).skip(1).take(1).map(start).filter(() => false);
  const nav = Navigation({dom, state$});
  const output = Renderer({dom, state$});
  const view$ = state$.merge(kickstart$).combine(render, nav.view$, output.view$);
  return {view$};
}
