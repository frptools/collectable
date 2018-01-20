import { commit, modify } from '@collectable/core';
import { CONST, ListStructure, OFFSET_ANCHOR, prependValues } from '../internals';

export function prepend<T> (value: T, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  var head = list._left;
  var slot = head.slot;
  if(head.group !== 0 && head.offset === 0 && slot.group !== 0 && slot.size < CONST.BRANCH_FACTOR) {
    list._lastWrite = OFFSET_ANCHOR.LEFT;
    list._size++;
    if(slot.group === list._group) {
      slot.adjustRange(1, 0, true);
    }
    else {
      slot = slot.cloneWithAdjustedRange(list._group, 1, 0, true, true);
      if(head.group !== list._group) {
        head = head.cloneToGroup(list._group);
        list._left = head;
      }
      head.slot = slot;
    }
    head.sizeDelta++;
    head.slotsDelta++;
    slot.slots[0] = arguments[0];
  }
  else {
    prependValues(list, [value]);
  }
  return commit(list);
}
