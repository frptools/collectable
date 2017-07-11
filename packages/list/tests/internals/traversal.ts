import {assert} from 'chai';
import {modify} from '@collectable/core';
import {empty, append, fromArray, get, size} from '../../src';
import {Slot, OFFSET_ANCHOR, TreeWorker} from '../../src/internals';
import {text, BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[Internals: traversal]', () => {
  test('activating the left view for the first time', () => {
    var values = makeValues(Math.pow(BRANCH_FACTOR, 3) + 1);
    var list = modify(empty<any>());
    for(var i = 0; i < values.length; i++) {
      append(values[i], list);
    }
    assert.strictEqual(get(0, list), text(0));
    assert.strictEqual(list._left.slot.size, BRANCH_FACTOR);
    assert.strictEqual(list._right.slot.size, 1);
  });

  test('refocusing a view down a path reserved by the other view', () => {
    var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR + 1);
    var list = modify(empty<any>());
    for(var i = 0; i < values.length; i++) {
      append(values[i], list);
    }
    // Force the left view to be created and positioned at the head of the list
    assert.strictEqual(get(0, list), text(0));
    assert.strictEqual(list._left.slot.size, BRANCH_FACTOR);
    assert.strictEqual(list._right.slot.size, 1);

    // The last write target was the tail, so refocusing to a non-tail ordinal will try to use the left view, which will
    // have to ascend to the top of the list where the target slot path is checked out and can't be descended through.
    var index = size(list) - BRANCH_FACTOR;
    assert.strictEqual(get(index, list), text(index));
  });

  test('refocusing a reserved tail in a two-node list', () => {
    var values = makeValues(BRANCH_FACTOR*2);
    var list = fromArray(values);
    assert.isTrue((<Slot<any>>list._right.parent.slot.slots[1]).isReserved());
    assert.isFalse((<Slot<any>>list._right.parent.slot.slots[0]).isReserved());
    var view = TreeWorker.focusView(list, BRANCH_FACTOR - 1, OFFSET_ANCHOR.RIGHT, true);
    assert.strictEqual(view, list._right);
    assert.isTrue(list._right.slot.isReserved());
    assert.isTrue((<Slot<any>>list._right.parent.slot.slots[0]).isReserved());
    assert.isFalse((<Slot<any>>list._right.parent.slot.slots[1]).isReserved());
  });
});
