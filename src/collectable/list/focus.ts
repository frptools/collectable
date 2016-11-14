import {CONST, last, padArrayLeft, log, publish} from './common';

import {Slot} from './slot';
import {View} from './view';
import {MutableList} from './mutable-list';

export const enum CREATE_VIEW {
  TRANSIENT,
  PERSIST_COMMITTED,
  PERSIST_UNCOMMITTED
}

export function focusHead<T>(list: MutableList<T>, mode: CREATE_VIEW): View<T> {
  var view = list._views[0], rvi = 1;
  list._leftViewIndex = -1;
  list._leftItemEnd = -1;

log(`[focus head] view.start: ${view.start}`);
  if(view.start > 0) {
    var level = 0;
    do {
      view = view.parent;
      level++;
log(`ascend to level ${level}`);
    } while(!view.parent.isNone());
    while(--level >= 0) {
      var slot = <Slot<T>>view.slot.slots[0];
      view = new View<T>(list._group, 0, slot.size, 0, 0, 0, false, view, slot);
log(`descend to level ${level}; left edge view created with id ${view.id}`);
    }

    if(mode > CREATE_VIEW.TRANSIENT) {
      list._views = padArrayLeft(list._views, 1);
      list._views[0] = view;
    }
    else {
      rvi = 0;
    }
  }
  else if(mode > CREATE_VIEW.TRANSIENT) {
    list._views[0] = view = view.clone(list._group);
  }

  list._rightViewIndex = rvi;
  list._rightItemStart = list._views.length > list._rightViewIndex
    ? list._views[list._rightViewIndex].start
    : list.size;

  return view;
}

export function focusTail<T>(list: MutableList<T>, makeEditable: boolean): View<T> {
  var view = last(list._views);
  if(makeEditable && view.group !== list._group) {
    list._views[list._views.length - 1] = view = view.clone(list._group);
  }
log(`[focus tail] view id: ${view.id}`);
  list._leftViewIndex = list._views.length - 2;
  list._leftItemEnd = list._leftViewIndex >= 0 ? list._views[list._leftViewIndex].end : -1;
  list._rightViewIndex = list._views.length;
  list._rightItemStart = list.size;
  return view;
}
