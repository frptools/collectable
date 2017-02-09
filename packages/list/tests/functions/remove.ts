import {assert} from 'chai';
import {empty, fromArray, prependArray, remove, removeRange} from '../../src';
import {arrayFrom} from '../../src/internals';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[List]', () => {
  suite('remove()', () => {
    test('returns an identical list if the index is out of bounds', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = fromArray(values);
      var list1 = remove(values.length, list0);
      var list2 = empty();
      var list3 = remove(1, list2);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length);
      assert.strictEqual(list2._size, 0);
      assert.strictEqual(list3._size, 0);
      assert.deepEqual(arrayFrom(list0), arrayFrom(list1));
      assert.deepEqual(arrayFrom(list2), arrayFrom(list3));
    });

    test('returns an empty list if the index points at the first element of a single-element list', () => {
      var list = remove(0, fromArray(['X']));
      assert.strictEqual(list._size, 0);
      assert.deepEqual(arrayFrom(list), []);
    });

    test('removes the specified index when the list has only one node', () => {
      var values = makeValues(BRANCH_FACTOR - 1);
      var list0 = fromArray(values);
      var list1 = remove(0, list0);
      var list2 = remove(1, list0);
      var list3 = remove(BRANCH_FACTOR - 2, list0);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length - 1);
      assert.strictEqual(list2._size, values.length - 1);
      assert.strictEqual(list3._size, values.length - 1);
      assert.deepEqual(arrayFrom(list0), values);
      assert.deepEqual(arrayFrom(list1), values.slice(1));
      assert.deepEqual(arrayFrom(list2), values.slice(0, 1).concat(values.slice(2)));
      assert.deepEqual(arrayFrom(list3), values.slice(0, values.length - 1));
    });

    test('removes the specified index when it is located at the head of the list', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = fromArray(values);
      var list1 = remove(0, list0);
      var list2 = remove(BRANCH_FACTOR >>> 1, list0);
      var list3 = remove(BRANCH_FACTOR - 1, list0);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length - 1);
      assert.strictEqual(list2._size, values.length - 1);
      assert.strictEqual(list3._size, values.length - 1);
      assert.deepEqual(arrayFrom(list0), values);
      assert.deepEqual(arrayFrom(list1), values.slice(1));
      assert.deepEqual(arrayFrom(list2), values.slice(0, BRANCH_FACTOR >>> 1).concat(values.slice((BRANCH_FACTOR >>> 1) + 1)));
      assert.deepEqual(arrayFrom(list3), values.slice(0, BRANCH_FACTOR - 1).concat(values.slice(BRANCH_FACTOR)));
    });

    test('removes the specified index when it is located at the tail of the list', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = fromArray(values);
      var list1 = remove(values.length - 1, list0);
      var list2 = remove(values.length - (BRANCH_FACTOR >>> 1), list0);
      var list3 = remove(values.length - BRANCH_FACTOR, list0);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length - 1);
      assert.strictEqual(list2._size, values.length - 1);
      assert.strictEqual(list3._size, values.length - 1);
      assert.deepEqual(arrayFrom(list0), values);
      assert.deepEqual(arrayFrom(list1), values.slice(0, values.length - 1));
      assert.deepEqual(arrayFrom(list2), values.slice(0, values.length - (BRANCH_FACTOR >>> 1)).concat(values.slice(values.length - (BRANCH_FACTOR >>> 1) + 1)));
      assert.deepEqual(arrayFrom(list3), values.slice(0, values.length - BRANCH_FACTOR).concat(values.slice(values.length - BRANCH_FACTOR + 1)));
    });

    test('removes the specified index when multi-level traversal would be required to find it', () => {
      var values = makeValues(BRANCH_FACTOR*4);
      var list0 = fromArray(values);
      var list1 = prependArray(values, empty());
      var list2 = remove(BRANCH_FACTOR + 2, list0);
      var list3 = remove(list1._size - BRANCH_FACTOR - 2, list1);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length);
      assert.strictEqual(list2._size, values.length - 1);
      assert.strictEqual(list3._size, values.length - 1);
      assert.deepEqual(arrayFrom(list0), values);
      assert.deepEqual(arrayFrom(list1), values.slice(0, values.length));
      assert.deepEqual(arrayFrom(list2), values.slice(0, BRANCH_FACTOR + 2).concat(values.slice(BRANCH_FACTOR + 3)));
      assert.deepEqual(arrayFrom(list3), values.slice(0, values.length - BRANCH_FACTOR - 2).concat(values.slice(values.length - BRANCH_FACTOR - 1)));
    });
  });
  suite('removeRange()', () => {
    test('returns an identical list if the index range is out of bounds', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = fromArray(values);
      var list1 = removeRange(values.length, values.length + 2, list0);
      var list2 = empty();
      var list3 = removeRange(1, 2, list2);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length);
      assert.strictEqual(list2._size, 0);
      assert.strictEqual(list3._size, 0);
      assert.deepEqual(arrayFrom(list0), arrayFrom(list1));
      assert.deepEqual(arrayFrom(list2), arrayFrom(list3));
    });

    test('returns an empty list if the index range is a superset of the list', () => {
      var list0 = fromArray(makeValues(BRANCH_FACTOR*3));
      var list1 = fromArray(makeValues(BRANCH_FACTOR >>> 1));
      assert.strictEqual(removeRange(0, list0._size, list0)._size, 0);
      assert.strictEqual(removeRange(0, list1._size, list1)._size, 0);
    });

    test('removes the specified index range when the list has only one node', () => {
      var values = makeValues(BRANCH_FACTOR - 1);
      var list0 = fromArray(values);
      var list1 = removeRange(0, 2, list0);
      var list2 = removeRange(1, 3, list0);
      var list3 = removeRange(values.length - 2, values.length, list0);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length - 2);
      assert.strictEqual(list2._size, values.length - 2);
      assert.strictEqual(list3._size, values.length - 2);
      assert.deepEqual(arrayFrom(list0), values);
      assert.deepEqual(arrayFrom(list1), values.slice(2));
      assert.deepEqual(arrayFrom(list2), values.slice(0, 1).concat(values.slice(3)));
      assert.deepEqual(arrayFrom(list3), values.slice(0, values.length - 2));
    });

    test('removes the specified index range when contained within the head of the list', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = fromArray(values);
      var list1 = removeRange(0, 2, list0);
      var list2 = removeRange(1, 3, list0);
      var list3 = removeRange(BRANCH_FACTOR - 2, BRANCH_FACTOR, list0);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length - 2);
      assert.strictEqual(list2._size, values.length - 2);
      assert.strictEqual(list3._size, values.length - 2);
      assert.deepEqual(arrayFrom(list0), values);
      assert.deepEqual(arrayFrom(list1), values.slice(2));
      assert.deepEqual(arrayFrom(list2), values.slice(0, 1).concat(values.slice(3)));
      assert.deepEqual(arrayFrom(list3), values.slice(0, BRANCH_FACTOR - 2).concat(values.slice(BRANCH_FACTOR)));
    });

    test('removes the specified index range when contained within the tail of the list', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = fromArray(values);
      var list1 = removeRange(values.length - 2, values.length, list0);
      var list2 = removeRange(values.length - (BRANCH_FACTOR >>> 1), values.length - (BRANCH_FACTOR >>> 1) + 2, list0);
      var list3 = removeRange(values.length - BRANCH_FACTOR, values.length - BRANCH_FACTOR + 2, list0);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length - 2);
      assert.strictEqual(list2._size, values.length - 2);
      assert.strictEqual(list3._size, values.length - 2);
      assert.deepEqual(arrayFrom(list0), values);
      assert.deepEqual(arrayFrom(list1), values.slice(0, values.length - 2));
      assert.deepEqual(arrayFrom(list2), values.slice(0, values.length - (BRANCH_FACTOR >>> 1)).concat(values.slice(values.length - (BRANCH_FACTOR >>> 1) + 2)));
      assert.deepEqual(arrayFrom(list3), values.slice(0, values.length - BRANCH_FACTOR).concat(values.slice(values.length - BRANCH_FACTOR + 2)));
    });

    test('removes the specified index range when it spans multiple leaf nodes', () => {
      var values = makeValues(BRANCH_FACTOR*4);
      var start = BRANCH_FACTOR + 2, end = BRANCH_FACTOR*2 + 2;
      var expected = values.slice(0, start).concat(values.slice(end));
      var list0 = fromArray(values);
      var list1 = prependArray(values, empty());
      var list2 = removeRange(start, end, list0);
      var list3 = removeRange(start, end, list1);

      assert.strictEqual(list0._size, values.length);
      assert.strictEqual(list1._size, values.length);
      assert.strictEqual(list2._size, expected.length);
      assert.strictEqual(list3._size, expected.length);
      assert.deepEqual(arrayFrom(list0), values);
      assert.deepEqual(arrayFrom(list1), values);
      assert.deepEqual(arrayFrom(list2), expected);
      assert.deepEqual(arrayFrom(list3), expected);
    });
  });
});