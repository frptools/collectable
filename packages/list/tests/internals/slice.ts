import {assert} from 'chai';
import {fromArray} from '../../src';
import {createList, getOtherView, Slot, sliceList, arrayFrom} from '../../src/internals';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[Internals: slicing and splicing]', () => {
  suite('slice()', () => {
    test('slicing an empty list is a noop', () => {
      var list = createList<any>(true);

      sliceList(list, 0, 1);

      assert.strictEqual(list._size, 0);
      assert.isTrue(list._left.isDefaultEmpty());
      assert.isTrue(list._right.isDefaultEmpty());
    });

    test('slicing a superset of a non-empty list is a noop', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = fromArray(values);

      sliceList(list, 0, values.length);

      assert.strictEqual(list._size, values.length);
      assert.deepEqual(arrayFrom(list), values);
    });

    test('slicing a zero-length subset of a list returns an empty list', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = fromArray(values);

      sliceList(list, 5, 5);

      assert.strictEqual(list._size, 0);
    });

    test('slicing away the left side of the head slot leaves the head view in an uncommitted state', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = fromArray(values);

      sliceList(list, 2, values.length);

      assert.strictEqual(list._size, values.length - 2);
      assert.strictEqual(list._left.offset, 0);
      assert.strictEqual(list._left.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list._left.sizeDelta, -2);
      assert.strictEqual(list._left.slotsDelta, -2);
      assert.isTrue(list._left.slot.isReserved());
      assert.isTrue((<Slot<any>>list._left.parent.slot.slots[list._left.slotIndex]).isReserved());
    });

    test('slicing away the right side of the tail slot leaves the tail view in an uncommitted state', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = fromArray(values);

      sliceList(list, 0, values.length - 2);

      assert.strictEqual(list._size, values.length - 2);
      assert.strictEqual(list._right.offset, 0);
      assert.strictEqual(list._right.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list._right.sizeDelta, -2);
      assert.strictEqual(list._right.slotsDelta, -2);
      assert.isTrue(list._right.slot.isReserved());
      assert.isTrue((<Slot<any>>list._right.parent.slot.slots[list._right.slotIndex]).isReserved());
    });

    test('slicing away the ends of the head and tail slots leaves both respective views in uncommitted states', () => {
      var values = makeValues(BRANCH_FACTOR*2);
      var list = fromArray(values);

      sliceList(list, 2, values.length - 2);

      assert.strictEqual(list._size, values.length - 4);
      assert.strictEqual(list._left.offset, 0);
      assert.strictEqual(list._left.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list._left.sizeDelta, -2);
      assert.strictEqual(list._left.slotsDelta, -2);
      assert.isTrue(list._left.slot.isReserved());
      assert.isTrue((<Slot<any>>list._left.parent.slot.slots[list._left.slotIndex]).isReserved());
      assert.strictEqual(list._size, values.length - 4);
      assert.strictEqual(list._right.offset, 0);
      assert.strictEqual(list._right.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list._right.sizeDelta, -2);
      assert.strictEqual(list._right.slotsDelta, -2);
      assert.isTrue(list._right.slot.isReserved());
      assert.isTrue((<Slot<any>>list._right.parent.slot.slots[list._right.slotIndex]).isReserved());
    });

    test('a left slice that does not include the current root reduces the height of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = fromArray(values);
      var halfbf = BRANCH_FACTOR >>> 1;
      var end = BRANCH_FACTOR*halfbf + halfbf;

      assert.isFalse(list._left.parent.isRoot());
      assert.isFalse(list._right.parent.isRoot());

      sliceList(list, 2, end);

      assert.strictEqual(list._size, end - 2);
      assert.strictEqual(list._left.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list._left.offset, 0);
      assert.strictEqual(list._right.slot.size, halfbf);
      assert.strictEqual(list._right.offset, 0);
      assert.strictEqual(list._left.parent, list._right.parent);
      assert.isTrue(list._left.parent.isRoot());
      assert.deepEqual(arrayFrom(list), values.slice(2, end));
    });

    test('a right slice that does not include the current root reduces the height of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = fromArray(values);
      var halfbf = BRANCH_FACTOR >>> 1;
      var start = values.length - BRANCH_FACTOR - halfbf;
      var end = values.length - 2;

      assert.isFalse(list._left.parent.isRoot());
      assert.isFalse(list._right.parent.isRoot());

      sliceList(list, start, end);

      assert.strictEqual(list._size, end - start);
      assert.strictEqual(list._left.slot.size, halfbf);
      assert.strictEqual(list._left.offset, 0);
      assert.strictEqual(list._right.slot.size, BRANCH_FACTOR - 2);
      assert.strictEqual(list._right.offset, 0);
      assert.strictEqual(list._left.parent, list._right.parent);
      assert.isTrue(list._left.parent.isRoot());
      assert.deepEqual(arrayFrom(list), values.slice(start, end));
    });

    {
      const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      const list = fromArray(values);
      const halfbf = BRANCH_FACTOR >>> 1;
      const start = BRANCH_FACTOR + 1;
      const end = start + halfbf;

      test(`slice(${start}, ${end}) of list[${values.length}]`, () => {
        sliceList(list, start, end);

        var view = list._left;
        if(view.isNone()) view = list._right;
        var other = getOtherView(list, view.anchor);
        assert.strictEqual(list._size, halfbf);
        assert.strictEqual(view.slot.size, halfbf);
        assert.strictEqual(view.offset, 0);
        assert.isTrue(other.isNone());
        assert.isTrue(view.isRoot());
        assert.deepEqual(arrayFrom(list), values.slice(start, end));
      });
    }

    {
      const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      const list = fromArray(values);
      const halfbf = BRANCH_FACTOR >>> 1;
      const start = 0;
      const end = halfbf + 1;

      test(`slice(${start}, ${end}) of list[${values.length}]`, () => {
        sliceList(list, start, end);
        assert.strictEqual(list._size, halfbf + 1);
        assert.strictEqual(list._left.slot.size, halfbf + 1);
        assert.strictEqual(list._left.offset, 0);
        assert.isTrue(list._left.isRoot());
        assert.isTrue(list._right.isNone());
        assert.deepEqual(arrayFrom(list), values.slice(start, end));
      });
    }

    {
      const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      const list = fromArray(values);
      const start = 1;
      const end = BRANCH_FACTOR;

      test(`slice(${start}, ${end}) of list[${values.length}]`, () => {
        sliceList(list, start, end);

        assert.strictEqual(list._size, BRANCH_FACTOR - 1);
        assert.strictEqual(list._left.slot.size, BRANCH_FACTOR - 1);
        assert.strictEqual(list._left.offset, 0);
        assert.isTrue(list._left.isRoot());
        assert.isTrue(list._right.isNone());
        assert.deepEqual(arrayFrom(list), values.slice(start, end));
      });
    }

    {
      const values = makeValues(BRANCH_FACTOR*2);
      const list = fromArray(values);
      const start = BRANCH_FACTOR;
      const end = BRANCH_FACTOR + 1;

      test(`slice(${start}, ${end}) of list[${values.length}]`, () => {
        sliceList(list, start, end);

        assert.strictEqual(list._size, 1);
        assert.strictEqual(list._right.slot.size, 1);
        assert.strictEqual(list._right.offset, 0);
        assert.isTrue(list._right.isRoot());
        assert.isTrue(list._left.isNone());
        assert.deepEqual(arrayFrom(list), values.slice(start, end));
      });
    }

    test('a slice that is a subset of the tail node removes the rest of the tree', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = fromArray(values);
      var halfbf = BRANCH_FACTOR >>> 1;
      var start = values.length - halfbf;
      var end = values.length;

      sliceList(list, start, end);

      assert.strictEqual(list._size, halfbf);
      assert.strictEqual(list._right.slot.size, halfbf);
      assert.strictEqual(list._right.offset, 0);
      assert.isTrue(list._left.isNone());
      assert.isTrue(list._right.isRoot());
      assert.deepEqual(arrayFrom(list), values.slice(start, end));
    });

    test('a slice can occur between node boundaries', function() {
      this.timeout(30000); // tslint:disable-line
      var values = makeValues(Math.pow(BRANCH_FACTOR, 4) - Math.pow(BRANCH_FACTOR, 3)*2);
      var list = fromArray(values);
      var start = Math.pow(BRANCH_FACTOR, 3);
      var end = values.length - start;

      sliceList(list, start, end);

      assert.strictEqual(list._size, end - start);
      assert.strictEqual(list._left.offset, 0);
      assert.strictEqual(list._left.slot.size, BRANCH_FACTOR);
      assert.strictEqual(list._right.offset, 0);
      assert.strictEqual(list._right.slot.size, BRANCH_FACTOR);
      assert.deepEqual(arrayFrom(list), values.slice(start, end));
    });
  });
});