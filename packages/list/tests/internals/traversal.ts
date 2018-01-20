import test from 'ava';
import { modify } from '@collectable/core';
import { append, empty, fromArray, get, size } from '../../src';
import { OFFSET_ANCHOR, Slot, TreeWorker } from '../../src/internals';
import { BRANCH_FACTOR, makeValues, text } from '../helpers';

test('activating the left view for the first time', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 3) + 1);
  var list = modify(empty<any>());
  for(var i = 0; i < values.length; i++) {
    append(values[i], list);
  }
  t.is(get(0, list), text(0));
  t.is(list._left.slot.size, BRANCH_FACTOR);
  t.is(list._right.slot.size, 1);
});

test('refocusing a view down a path reserved by the other view', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR + 1);
  var list = modify(empty<any>());
  for(var i = 0; i < values.length; i++) {
    append(values[i], list);
  }
  // Force the left view to be created and positioned at the head of the list
  t.is(get(0, list), text(0));
  t.is(list._left.slot.size, BRANCH_FACTOR);
  t.is(list._right.slot.size, 1);

  // The last write target was the tail, so refocusing to a non-tail ordinal will try to use the left view, which will
  // have to ascend to the top of the list where the target slot path is checked out and can't be descended through.
  var index = size(list) - BRANCH_FACTOR;
  t.is(get(index, list), text(index));
});

test('refocusing a reserved tail in a two-node list', t => {
  var values = makeValues(BRANCH_FACTOR*2);
  var list = fromArray(values);
  t.true((<Slot<any>>list._right.parent.slot.slots[1]).isReserved());
  t.false((<Slot<any>>list._right.parent.slot.slots[0]).isReserved());
  var view = TreeWorker.focusView(list, BRANCH_FACTOR - 1, OFFSET_ANCHOR.RIGHT, true);
  t.is(view, list._right);
  t.true(list._right.slot.isReserved());
  t.true((<Slot<any>>list._right.parent.slot.slots[0]).isReserved());
  t.false((<Slot<any>>list._right.parent.slot.slots[1]).isReserved());
});
