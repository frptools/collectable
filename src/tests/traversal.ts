declare function require(moduleName: string): any;

import {assert} from 'chai';
import {List} from '../collectable/list';
import {ListState} from '../collectable/list/state';
import {Slot} from '../collectable/list/slot';
import {append, prepend} from '../collectable/list/capacity';
import {getAtOrdinal} from '../collectable/list/traversal';
import {concat} from '../collectable/list/concat';

import {text,
  BRANCH_FACTOR,
  assertArrayElementsAreEqual,
  slotValues,
  gatherLeafValues,
  commitToRoot,
  tailSize,
  headSize,
  headSlot,
  tailSlot,
  rootSlot,
  makeValues
} from './test-utils';

suite.only('[List: traversal]', () => {
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

