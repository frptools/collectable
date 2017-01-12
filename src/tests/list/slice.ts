import {assert} from 'chai';

import {PList} from '../../collectable/list';
import {emptyState, getOtherView} from '../../collectable/list/state';
import {Slot} from '../../collectable/list/slot';
import {sliceList} from '../../collectable/list/slice';
import {createArray} from '../../collectable/list/values';

import {BRANCH_FACTOR, makeValues} from './test-utils';

suite('[List: slicing and splicing]', () => {
  suite('slice()', () => {
    test('slicing an empty list is a noop', () => {
      var list = emptyState<any>(true);

      sliceList(list, 0, 1);

      assert.strictEqual(list.size, 0);
      assert.isTrue(list.left.isDefaultEmpty());
      assert.isTrue(list.right.isDefaultEmpty());
    });

    test('slicing a superset of a non-empty list is a noop', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = PList.fromArray(values)._state;

      sliceList(list, 0, values.length);

      assert.strictEqual(list.size, values.length);
      assert.deepEqual(createArray(list), values);
    });

    test('slicing a zero-length subset of a list returns an empty list', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = PList.fromArray(values)._state;

      sliceList(list, 5, 5);

      assert.strictEqual(list.size, 0);
    });

    test('slicing away the left side of the head slot leaves the head view in an uncommitted state', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = PList.fromArray(values)._state;

      sliceList(list, 2, values.length);

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
      var list = PList.fromArray(values)._state;

      sliceList(list, 0, values.length - 2);

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
      var list = PList.fromArray(values)._state;

      sliceList(list, 2, values.length - 2);

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
      var list = PList.fromArray(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var end = BRANCH_FACTOR*halfbf + halfbf;

      assert.isFalse(list.left.parent.isRoot());
      assert.isFalse(list.right.parent.isRoot());

      sliceList(list, 2, end);

      assert.strictEqual(list.size, end - 2);
      assert.strictEqual(list.left.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list.left.offset, 0);
      assert.strictEqual(list.right.slot.size, halfbf);
      assert.strictEqual(list.right.offset, 0);
      assert.strictEqual(list.left.parent, list.right.parent);
      assert.isTrue(list.left.parent.isRoot());
      assert.deepEqual(createArray(list), values.slice(2, end));
    });

    test('a right slice that does not include the current root reduces the height of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = PList.fromArray(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var start = values.length - BRANCH_FACTOR - halfbf;
      var end = values.length - 2;

      assert.isFalse(list.left.parent.isRoot());
      assert.isFalse(list.right.parent.isRoot());

      sliceList(list, start, end);

      assert.strictEqual(list.size, end - start);
      assert.strictEqual(list.left.slot.size, halfbf);
      assert.strictEqual(list.left.offset, 0);
      assert.strictEqual(list.right.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list.right.offset, 0);
      assert.strictEqual(list.left.parent, list.right.parent);
      assert.isTrue(list.left.parent.isRoot());
      assert.deepEqual(createArray(list), values.slice(start, end));
    });

    {
      const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      const list = PList.fromArray(values)._state;
      const halfbf = BRANCH_FACTOR >>> 1;
      const start = BRANCH_FACTOR + 1;
      const end = start + halfbf;

      test(`slice(${start}, ${end}) of list[${values.length}]`, () => {
        sliceList(list, start, end);

        var view = list.left;
        if(view.isNone()) view = list.right;
        var other = getOtherView(list, view.anchor);
        assert.strictEqual(list.size, halfbf);
        assert.strictEqual(view.slot.size, halfbf);
        assert.strictEqual(view.offset, 0);
        assert.isTrue(other.isNone());
        assert.isTrue(view.isRoot());
        assert.deepEqual(createArray(list), values.slice(start, end));
      });
    }

    {
      const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      const list = PList.fromArray(values)._state;
      const halfbf = BRANCH_FACTOR >>> 1;
      const start = 0;
      const end = halfbf + 1;

      test(`slice(${start}, ${end}) of list[${values.length}]`, () => {
        sliceList(list, start, end);
        assert.strictEqual(list.size, halfbf + 1);
        assert.strictEqual(list.left.slot.size, halfbf + 1);
        assert.strictEqual(list.left.offset, 0);
        assert.isTrue(list.left.isRoot());
        assert.isTrue(list.right.isNone());
        assert.deepEqual(createArray(list), values.slice(start, end));
      });
    }

    {
      const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      const list = PList.fromArray(values)._state;
      const start = 1;
      const end = BRANCH_FACTOR;

      test(`slice(${start}, ${end}) of list[${values.length}]`, () => {
        sliceList(list, start, end);

        assert.strictEqual(list.size, BRANCH_FACTOR - 1);
        assert.strictEqual(list.left.slot.size, BRANCH_FACTOR - 1);
        assert.strictEqual(list.left.offset, 0);
        assert.isTrue(list.left.isRoot());
        assert.isTrue(list.right.isNone());
        assert.deepEqual(createArray(list), values.slice(start, end));
      });
    }

    {
      const values = makeValues(BRANCH_FACTOR*2);
      const list = PList.fromArray(values)._state;
      const start = BRANCH_FACTOR;
      const end = BRANCH_FACTOR + 1;

      test(`slice(${start}, ${end}) of list[${values.length}]`, () => {
        sliceList(list, start, end);

        assert.strictEqual(list.size, 1);
        assert.strictEqual(list.right.slot.size, 1);
        assert.strictEqual(list.right.offset, 0);
        assert.isTrue(list.right.isRoot());
        assert.isTrue(list.left.isNone());
        assert.deepEqual(createArray(list), values.slice(start, end));
      });
    }

    test('a slice that is a subset of the tail node removes the rest of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = PList.fromArray(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var start = values.length - halfbf;
      var end = values.length;

      sliceList(list, start, end);

      assert.strictEqual(list.size, halfbf);
      assert.strictEqual(list.right.slot.size, halfbf);
      assert.strictEqual(list.right.offset, 0);
      assert.isTrue(list.left.isNone());
      assert.isTrue(list.right.isRoot());
      assert.deepEqual(createArray(list), values.slice(start, end));
    });

    test('a slice can occur between node boundaries', function() {
      this.timeout(30000); // tslint:disable-line
      var values = makeValues(Math.pow(BRANCH_FACTOR, 4) - Math.pow(BRANCH_FACTOR, 3)*2);
      var list = PList.fromArray(values)._state;
      var start = Math.pow(BRANCH_FACTOR, 3);
      var end = values.length - start;

      sliceList(list, start, end);

      assert.strictEqual(list.size, end - start);
      assert.strictEqual(list.left.offset, 0);
      assert.strictEqual(list.left.slot.size, BRANCH_FACTOR);
      assert.strictEqual(list.right.offset, 0);
      assert.strictEqual(list.right.slot.size, BRANCH_FACTOR);
      assert.deepEqual(createArray(list), values.slice(start, end));
    });
  });
});