import {assert} from 'chai';

import {List} from '../collectable/list';
import {ListState} from '../collectable/list/state';
import {Slot} from '../collectable/list/slot';
import {slice} from '../collectable/list/splice';

import {BRANCH_FACTOR, gatherLeafValues, commitToRoot, makeValues} from './test-utils';

suite('[List: slicing and splicing]', () => {
  suite('slice()', () => {
    test('slicing an empty list is a noop', () => {
      var list = ListState.empty<any>(true);

      slice(list, 0, 1);

      assert.strictEqual(list.size, 0);
      assert.isTrue(list.left.isDefaultEmpty());
      assert.isTrue(list.right.isDefaultEmpty());
    });

    test('slicing a superset of a non-empty list is a noop', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = List.of(values)._state;

      slice(list, 0, values.length);
      commitToRoot(list);

      assert.strictEqual(list.size, values.length);
      assert.deepEqual(gatherLeafValues(list), values);
    });

    test('slicing a zero-length subset of a list returns an empty list', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = List.of(values)._state;

      slice(list, 5, 5);

      assert.strictEqual(list.size, 0);
    });

    test('slicing away the left side of the head slot leaves the head view in an uncommitted state', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = List.of(values)._state;

      slice(list, 2, values.length);

      assert.strictEqual(list.size, values.length - 2);
      assert.strictEqual(list.left.offset, 0);
      assert.strictEqual(list.left.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list.left.sizeDelta, -2);
      assert.strictEqual(list.left.slotsDelta, -2);
      assert.isTrue(list.left.slot.isReserved());
      assert.isTrue((<Slot<any>>list.left.parent.slot.slots[list.left.slotIndex]).isReserved());
    });

    test('slicing away the right side of the tail slot leaves the tail view in an uncommitted state', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = List.of(values)._state;

      slice(list, 0, values.length - 2);

      assert.strictEqual(list.size, values.length - 2);
      assert.strictEqual(list.right.offset, 0);
      assert.strictEqual(list.right.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list.right.sizeDelta, -2);
      assert.strictEqual(list.right.slotsDelta, -2);
      assert.isTrue(list.right.slot.isReserved());
      assert.isTrue((<Slot<any>>list.right.parent.slot.slots[list.right.slotIndex]).isReserved());
    });

    test('slicing away the ends of the head and tail slots leaves both respective views in uncommitted states', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = List.of(values)._state;

      slice(list, 2, values.length - 2);

      assert.strictEqual(list.size, values.length - 4);
      assert.strictEqual(list.left.offset, 0);
      assert.strictEqual(list.left.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list.left.sizeDelta, -2);
      assert.strictEqual(list.left.slotsDelta, -2);
      assert.isTrue(list.left.slot.isReserved());
      assert.isTrue((<Slot<any>>list.left.parent.slot.slots[list.left.slotIndex]).isReserved());
      assert.strictEqual(list.size, values.length - 4);
      assert.strictEqual(list.right.offset, 0);
      assert.strictEqual(list.right.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list.right.sizeDelta, -2);
      assert.strictEqual(list.right.slotsDelta, -2);
      assert.isTrue(list.right.slot.isReserved());
      assert.isTrue((<Slot<any>>list.right.parent.slot.slots[list.right.slotIndex]).isReserved());
    });

    test('a left slice that does not include the current root reduces the height of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = List.of(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var end = BRANCH_FACTOR*halfbf + halfbf;

      assert.isFalse(list.left.parent.isRoot());
      assert.isFalse(list.right.parent.isRoot());

      slice(list, 2, end);
      commitToRoot(list);

      assert.strictEqual(list.size, end - 2);
      assert.strictEqual(list.left.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list.left.offset, 0);
      assert.strictEqual(list.right.slot.size, halfbf);
      assert.strictEqual(list.right.offset, 0);
      assert.strictEqual(list.left.parent, list.right.parent);
      assert.isTrue(list.left.parent.isRoot());
    });

    test('a right slice that does not include the current root reduces the height of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = List.of(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var start = values.length - BRANCH_FACTOR - halfbf;
      var end = values.length - 2;

      assert.isFalse(list.left.parent.isRoot());
      assert.isFalse(list.right.parent.isRoot());

      slice(list, start, end);

      assert.strictEqual(list.size, end - start);
      assert.strictEqual(list.left.slot.size, halfbf);
      assert.strictEqual(list.left.offset, 0);
      assert.strictEqual(list.right.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list.right.offset, 0);
      assert.strictEqual(list.left.parent, list.right.parent);
      assert.isTrue(list.left.parent.isRoot());
    });

    test('a slice that is a subset of a central leaf node removes the rest of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = List.of(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var start = BRANCH_FACTOR + 1;
      var end = start + halfbf;

      slice(list, start, end);
      commitToRoot(list);

      assert.strictEqual(list.size, halfbf);
      assert.strictEqual(list.left.slot.size, halfbf);
      assert.strictEqual(list.left.offset, 0);
      assert.isTrue(list.left.isRoot());
      assert.isTrue(list.right.isNone());
    });

    test('a slice that is a subset of the head node removes the rest of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = List.of(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var start = 0;
      var end = halfbf + 1;

      slice(list, start, end);
      commitToRoot(list);

      assert.strictEqual(list.size, halfbf);
      assert.strictEqual(list.left.slot.size, halfbf);
      assert.strictEqual(list.left.offset, 0);
      assert.isTrue(list.left.isRoot());
      assert.isTrue(list.right.isNone());
    });

    test('a slice that is a subset of the tail node removes the rest of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = List.of(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var start = values.length - halfbf;
      var end = values.length;

      slice(list, start, end);
      commitToRoot(list);

      assert.strictEqual(list.size, halfbf);
      assert.strictEqual(list.right.slot.size, halfbf);
      assert.strictEqual(list.right.offset, 0);
      assert.isTrue(list.left.isNone());
      assert.isTrue(list.right.isRoot());
    });
  });
});