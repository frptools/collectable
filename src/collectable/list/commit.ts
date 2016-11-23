import {max} from './common';

import {ListState} from './state';
import {View} from './view';

export const enum COMMIT_DIRECTION {
  LEFT = -1,
  RIGHT = 1
}

export function resetCommit<T>(list: ListState<T>, viewIndex: number): void {
  list.leftViewIndex = max(-1, viewIndex - 1);
  list.leftItemEnd = viewIndex > 0 ? list.views[viewIndex - 1].end : -1;
  list.rightViewIndex = viewIndex + 1;
  list.rightItemStart = viewIndex >= list.views.length - 1 ? list.size : list.views[viewIndex + 1].start;
}

export function commit<T>(list: ListState<T>, targetView: View<T>, targetLevel: number, positionDelta: number, preserveUncommitted: boolean): void {
  commitAdjacent(list, targetView, targetLevel, positionDelta, preserveUncommitted, COMMIT_DIRECTION.LEFT);
  commitAdjacent(list, targetView, targetLevel, positionDelta, preserveUncommitted, COMMIT_DIRECTION.RIGHT);
}

export function commitAdjacent<T>(list: ListState<T>, targetView: View<T>, targetLevel: number, positionDelta: number, preserveUncommitted: boolean, direction: COMMIT_DIRECTION): void {
  var index: number;
  if(direction === COMMIT_DIRECTION.LEFT) {
    if((index = list.leftViewIndex) === -1 || list.leftItemEnd < targetView.offset) {
      return;
    }
    list.leftViewIndex = index - 1;
    list.leftItemEnd = index > 0 ? list.views[list.leftViewIndex].end : -1;
  }
  else {
    if((index = list.rightViewIndex) >= list.views.length || list.rightItemStart >= targetView.end) {
      return;
    }
    list.rightViewIndex = index + 1;
    list.rightItemStart = list.rightViewIndex < list.views.length ? list.views[list.rightViewIndex].start : list.size;
  }

  var level = 0;
  var view = list.views[index];
  if(view.group !== list.group) {
    list.views[index] = view = view.clone(list.group);
  }

  while(level <= targetLevel) {
    if(level === targetLevel - 1) {
      view.parent = targetView;
      if(positionDelta !== 0) {
        view.slotIndex += positionDelta;
      }
    }

    if(direction === COMMIT_DIRECTION.RIGHT && level < targetLevel - 1) {
      view = view.ascend(preserveUncommitted && view.uncommitted);
    }

    if(level > 0) {
      commitAdjacent(list, view, level, positionDelta, preserveUncommitted, direction);
    }

    if(direction === COMMIT_DIRECTION.LEFT && level < targetLevel - 1) {
      view = view.ascend(preserveUncommitted && view.uncommitted);
    }

    level++;
  }
}
