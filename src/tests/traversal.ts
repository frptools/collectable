import {assert} from 'chai';
import {List} from '../collectable/list';

import {text, BRANCH_FACTOR, makeValues} from './test-utils';

suite('[List: traversal]', () => {
  test('activating the left view for the first time', () => {
    var values = makeValues(Math.pow(BRANCH_FACTOR, 3) + 1);
    var list = List.empty<any>().asMutable();
    for(var i = 0; i < values.length; i++) {
      list.append(values[i]);
    }
    assert.strictEqual(list.get(0), text(0));
    assert.strictEqual(list._state.left.slot.size, BRANCH_FACTOR);
    assert.strictEqual(list._state.right.slot.size, 1);
  });

  test('refocusing a view down a path reserved by the other view', () => {
    var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR + 1);
    var list = List.empty<any>().asMutable();
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
});

