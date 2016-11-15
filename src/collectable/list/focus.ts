import {CONST, last, padArrayLeft, ordinalIndex} from './common';

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

export function viewAtOrdinal<T>(views: View<T>[], ordinal: number, setUncommitted: boolean): View<T>|undefined {
  var viewIndex = views.length - 1;
  var view = views[viewIndex];
  ordinal = ordinalIndex(view.end, ordinal);
  if(ordinal === -1) return void 0;
  if(view.start <= ordinal) {
    return view.end > ordinal ? view : void 0;
  }
  var setUncommitted = true;

  if(views.length > 1) { // check the other views to figure out which one to use
    view = views[0];
    if(view.isInRange(ordinal)) return view;
    if(view.start === 0) { // this is the head view and should be preserved
      if(views.length === 2) { // a reusable focus view will be created in the middle of the views array
        views.length = 3;
        views[2] = views[1];
      }
      else { // the middle view exists and should be used
        view = views[1];
        if(view.isInRange(ordinal)) return view;
      }
      viewIndex = 1;
      setUncommitted = view.changed;
    }
    else { // the front view is a reusable focus view, but is currently out of range
      viewIndex = 0;
      setUncommitted = false;
    }
  }
  else { // make space at the front for a new focus view
    views.length = 2;
    views[1] = views[0];
    viewIndex = 0;
  }

  for(var shift = CONST.BRANCH_INDEX_BITCOUNT, view = view.ascend(setUncommitted);
      !view.isInRange(ordinal);
      shift += CONST.BRANCH_INDEX_BITCOUNT, view.ascend(setUncommitted));
  views[viewIndex] = view = view.descendToOrdinal(ordinal, shift, setUncommitted);
  return view;
}

export function getAtOrdinal<T>(views: View<T>[], ordinal: number): T|undefined {
  var view = viewAtOrdinal(views, ordinal, false);
  if(view === void 0) return void 0;
  return <T>view.slot.slots[ordinal - view.start];
}