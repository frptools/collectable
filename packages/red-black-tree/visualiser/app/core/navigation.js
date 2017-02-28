import {div, a} from '@motorcycle/dom';

var oldIndex = 0;
function focusItem(index, init = false) {
  return function(/*vn0, vn1*/) {
    if(!init && index === oldIndex) return;
    oldIndex = index;
    const body = document.querySelector('body');
    const el = arguments[arguments.length - 1].element;
    setTimeout(() => {
      const y0 = body.scrollTop;
      const y1 = body.scrollTop + body.offsetHeight;
      if(el.offsetTop + el.offsetHeight > y1 || el.offsetTop < y0) {
        body.scrollTop = el.offsetTop - body.offsetHeight/2 + el.offsetHeight/2;
      }
    }, 1);
    // el.scrollIntoViewIfNeeded(false);
  }
}

function render(dom) {
  return function(state) {
    const items = state.versions
      .valueSeq()
      .map((entry, i) => {
        const active = i === (state.index || 0);
        const {done} = entry;
        const postpatch = active ? focusItem(state.index) : void 0;
        const insert = active ? focusItem(state.index, true) : void 0;
        return div('.list-item', {class: {active, done}, postpatch, insert}, [
          a('.link', {href: 'javascript:void 0', attrs: {'data-index': i.toString()}}, `${i+1}. ${entry.label}`)
        ]);
      })
      .toArray();
    return div('.nav', [
      div('.versions', items)
    ]);
  };
}

export function Navigation({dom, state$}) {
  return {
    view$: state$.map(render(dom))
  };
}