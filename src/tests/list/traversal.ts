import {assert} from 'chai';
import {PList} from '../../collectable/list';
import {Slot} from '../../collectable/list/slot';
import {OFFSET_ANCHOR} from '../../collectable/list/common';
import {TreeWorker} from '../../collectable/list/traversal';

import {text, BRANCH_FACTOR, makeValues} from './test-utils';

suite('[List: traversal]', () => {
  test('activating the left view for the first time', () => {
    var values = makeValues(Math.pow(BRANCH_FACTOR, 3) + 1);
    var list = PList.empty<any>().asMutable();
    for(var i = 0; i < values.length; i++) {
      list.append(values[i]);
    }
    assert.strictEqual(list.get(0), text(0));
    assert.strictEqual(list._state.left.slot.size, BRANCH_FACTOR);
    assert.strictEqual(list._state.right.slot.size, 1);
  });

  test('refocusing a view down a path reserved by the other view', () => {
    var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR + 1);
    var list = PList.empty<any>().asMutable();
    for(var i = 0; i < values.length; i++) {
      list.append(values[i]);
    }
    // Force the left view to be created and positioned at the head of the list
    assert.strictEqual(list.get(0), text(0));
    assert.strictEqual(list._state.left.slot.size, BRANCH_FACTOR);
    assert.strictEqual(list._state.right.slot.size, 1);

    // The last write target was the tail, so refocusing to a non-tail ordinal will try to use the left view, which will
    // have to ascend to the top of the list where the target slot path is checked out and can't be descended through.
    var index = list.size - BRANCH_FACTOR;
    assert.strictEqual(list.get(index), text(index));
  });

  test('refocusing a reserved tail in a two-node list', () => {
    var values = makeValues(BRANCH_FACTOR*2);
    var list = PList.fromArray(values)._state;
    assert.isTrue((<Slot<any>>list.right.parent.slot.slots[1]).isReserved());
    assert.isFalse((<Slot<any>>list.right.parent.slot.slots[0]).isReserved());
    var view = TreeWorker.focusView(list, BRANCH_FACTOR - 1, OFFSET_ANCHOR.RIGHT, true);
    assert.strictEqual(view, list.right);
    assert.isTrue(list.right.slot.isReserved());
    assert.isTrue((<Slot<any>>list.right.parent.slot.slots[0]).isReserved());
    assert.isFalse((<Slot<any>>list.right.parent.slot.slots[1]).isReserved());
  });
});
