import {assert} from 'chai';
import {empty, fromArray, concat, concatAll, concatLeft} from '../../src';
import {arrayFrom} from '../../src/internals';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[List]', () => {
  suite('concat()', () => {
    test('should return an empty list if both lists are empty', () => {
      const list1 = empty(), list2 = empty();
      assert.strictEqual(concat(list1, list2)._size, 0);
    });

    test('should return the non-empty list when one list is empty', () => {
      const list1 = empty(), list2 = fromArray(['J', 'K']);
      assert.strictEqual(concat(list1, list2), list2);
      assert.strictEqual(concat(list2, list1), list2);
    });

    test('should return a new list containing all of the values in both lists', () => {
      var values1 = makeValues(2);
      var values2 = makeValues(BRANCH_FACTOR >>> 1);
      var values3 = makeValues((BRANCH_FACTOR << 1) + (BRANCH_FACTOR >>> 2));
      var list1 = fromArray(values1);
      var list2 = fromArray(values2);
      var list3 = fromArray(values3);
      var list4 = concat(list3, list2);

      assert.deepEqual(arrayFrom(concat(list1, list2)), values1.concat(values2));
      assert.deepEqual(arrayFrom(concat(list2, list1)), values2.concat(values1));
      assert.deepEqual(arrayFrom(concat(list2, list3)), values2.concat(values3));
      assert.deepEqual(arrayFrom(list4), values3.concat(values2));
      assert.deepEqual(arrayFrom(concat(list1, concat(list2, list3))), values1.concat(values2.concat(values3)));
      assert.deepEqual(arrayFrom(concat(list4, list1)), values3.concat(values2).concat(values1));
    });
  });

  suite('concatLeft()', () => {
    test('should return an empty list if both lists are empty', () => {
      const list1 = empty(), list2 = empty();
      assert.strictEqual(concatLeft(list1, list2)._size, 0);
    });

    test('should return the non-empty list when one list is empty', () => {
      const list1 = empty(), list2 = fromArray(['J', 'K']);
      assert.strictEqual(concatLeft(list1, list2), list2);
      assert.strictEqual(concatLeft(list2, list1), list2);
    });

    test('should return a new list containing all of the values in both lists', () => {
      var values1 = makeValues(2);
      var values2 = makeValues(BRANCH_FACTOR >>> 1);
      var values3 = makeValues((BRANCH_FACTOR << 1) + (BRANCH_FACTOR >>> 2));
      var list1 = fromArray(values1);
      var list2 = fromArray(values2);
      var list3 = fromArray(values3);
      var list4 = concatLeft(list2, list3);

      assert.deepEqual(arrayFrom(concatLeft(list2, list1)), values1.concat(values2));
      assert.deepEqual(arrayFrom(concatLeft(list1, list2)), values2.concat(values1));
      assert.deepEqual(arrayFrom(concatLeft(list3, list2)), values2.concat(values3));
      assert.deepEqual(arrayFrom(list4), values3.concat(values2));
      assert.deepEqual(arrayFrom(concatLeft(concatLeft(list3, list2), list1)), values1.concat(values2).concat(values3));
      assert.deepEqual(arrayFrom(concatLeft(list1, list4)), values3.concat(values2).concat(values1));
    });
  });

  suite('concatAll()', () => {
    test('should return an empty list if all lists are empty', () => {
      const list1 = empty(), list2 = empty(), list3 = empty();
      assert.strictEqual(concatAll([list1, list2, list3])._size, 0);
    });

    test('should return a new list containing all of the values in all lists', () => {
      var values1 = makeValues(2);
      var values2 = makeValues(BRANCH_FACTOR >>> 1);
      var values3 = makeValues((BRANCH_FACTOR << 1) + (BRANCH_FACTOR >>> 2));
      var list1 = fromArray(values1);
      var list2 = fromArray(values2);
      var list3 = fromArray(values3);

      assert.deepEqual(arrayFrom(concatAll([list1, list2])), values1.concat(values2));
      assert.deepEqual(arrayFrom(concatAll([list2, list1])), values2.concat(values1));
      assert.deepEqual(arrayFrom(concatAll([list2, list3])), values2.concat(values3));
      assert.deepEqual(arrayFrom(concatAll([list1, list2, list3])), values1.concat(values2.concat(values3)));
      assert.deepEqual(arrayFrom(concatAll([list3, list2, list1])), values3.concat(values2).concat(values1));
    });
  });
});