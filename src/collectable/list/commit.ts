import {MutableState} from './state';
import {View} from './view';

export const enum COMMIT_DIRECTION {
  LEFT = -1,
  RIGHT = 1
}

export function commit<T>(list: MutableState<T>, targetView: View<T>, targetLevel: number): void {
  commitAdjacent(list, targetView, targetLevel, COMMIT_DIRECTION.LEFT);
  commitAdjacent(list, targetView, targetLevel, COMMIT_DIRECTION.RIGHT);
}

export function commitAdjacent<T>(list: MutableState<T>, targetView: View<T>, targetLevel: number, direction: COMMIT_DIRECTION): void {
  var index: number;
  if(direction === COMMIT_DIRECTION.LEFT) {
    if((index = list.leftViewIndex) === -1 || list.leftItemEnd < targetView.start) {
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
    }

    if(direction === COMMIT_DIRECTION.RIGHT && level < targetLevel - 1) {
      view = view.ascend(false);
    }

    if(level > 0) {
      commitAdjacent(list, view, level, direction);
    }

    if(direction === COMMIT_DIRECTION.LEFT && level < targetLevel - 1) {
      view = view.ascend(false);
    }

    level++;
  }
}
