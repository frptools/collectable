import {last, padArrayLeft, ordinalIndex} from './common';

import {Slot} from './slot';
import {View} from './view';
import {MutableState} from './state';

export const enum CREATE_VIEW {
  TRANSIENT,
  PERSIST_COMMITTED,
  PERSIST_UNCOMMITTED
}

export function focusHead<T>(list: MutableState<T>, mode: CREATE_VIEW): View<T> {
  var view = list.views[0], rvi = 1;
  list.leftViewIndex = -1;
  list.leftItemEnd = -1;

  if(view.start > 0) {
    var level = 0;
    do {
      view = view.parent;
      level++;
    } while(!view.parent.isNone());
    while(--level >= 0) {
      var slot = <Slot<T>>view.slot.slots[0];
      view = new View<T>(list.group, 0, slot.size, 0, 0, 0, false, view, slot);
    }

    if(mode > CREATE_VIEW.TRANSIENT) {
      list.views = padArrayLeft(list.views, 1);
      list.views[0] = view;
    }
    else {
      rvi = 0;
    }
  }
  else if(mode > CREATE_VIEW.TRANSIENT) {
    list.views[0] = view = view.clone(list.group);
  }

  list.rightViewIndex = rvi;
  list.rightItemStart = list.views.length > list.rightViewIndex
    ? list.views[list.rightViewIndex].start
    : list.size;

  return view;
}

export function focusTail<T>(list: MutableState<T>, makeEditable: boolean): View<T> {
  var view = last(list.views);
  if(makeEditable && view.group !== list.group) {
    list.views[list.views.length - 1] = view = view.clone(list.group);
  }
  list.leftViewIndex = list.views.length - 2;
  list.leftItemEnd = list.leftViewIndex >= 0 ? list.views[list.leftViewIndex].end : -1;
  list.rightViewIndex = list.views.length;
  list.rightItemStart = list.size;
  return view;
}

export function viewAtOrdinal<T>(views: View<T>[], ordinal: number, writable: boolean): View<T>|undefined {
  var viewIndex = views.length - 1;
  var view = views[viewIndex];
  ordinal = ordinalIndex(view.end, ordinal);
  if(ordinal === -1) return void 0;
  while(view.start > ordinal && viewIndex > 0) {
    view = views[--viewIndex];
    if(view.end >= ordinal) {
      // then the ordinal we want lies between this view and the next
      // todo: focus the central view on the specified ordinal
    }
  }
  return view;
}

export function getAtOrdinal<T>(views: View<T>[], ordinal: number): T|undefined {
  var view = viewAtOrdinal(views, ordinal, false);
  if(view === void 0) return void 0;
  return <T>view.slot.slots[ordinal - view.start];
}