import {assert} from 'chai';
import {fromArray, insert, insertArray, insertArrayMapped, fromArrayMapped} from '../../src';
import {arrayFrom} from '../../src/internals';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[List]', () => {
  suite('#insert()', () => {
    test('appends to the list when using index === list.size', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = fromArray<any>(values);
      var list2 = insert(list1._size, 'J', list1);
      assert.deepEqual(arrayFrom(list1), values);
      assert.deepEqual(arrayFrom(list2), values.concat(['J']));
    });

    test('prepends to the list when using index 0', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = fromArray<any>(values);
      var list2 = insert(0, 'J', list1);
      assert.deepEqual(arrayFrom(list2), ['J'].concat(values));
    });

    test('inserts the arguments in their respective order before the specified index', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = fromArray<any>(values);
      var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
      var list2 = insert(index, 'J', list1);
      assert.deepEqual(arrayFrom(list1), values);
      assert.deepEqual(arrayFrom(list2), values.slice(0, index).concat(['J']).concat(values.slice(index)));
    });
  });

  suite('#insertArray()', () => {
    test('returns the same list if the value array is empty', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list1 = fromArray<any>(values);
      var list2 = insertArray(0, [], list1);
      assert.strictEqual(list1, list2);
      assert.deepEqual(arrayFrom(list2), values);
    });

    test('appends to the list when using index === list.size', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = fromArray<any>(values);
      var list2 = insertArray(list1._size, ['J', 'K'], list1);
      assert.deepEqual(arrayFrom(list1), values);
      assert.deepEqual(arrayFrom(list2), values.concat(['J', 'K']));
    });

    test('prepends to the list when using index 0', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = fromArray<any>(values);
      var list2 = insertArray(0, ['J', 'K'], list1);
      assert.deepEqual(arrayFrom(list2), ['J', 'K'].concat(values));
    });

    test('inserts the elements of the array in their respective order before the specified index', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = fromArray<any>(values);
      var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
      var list2 = insertArray(index, ['J', 'K'], list1);
      assert.deepEqual(arrayFrom(list1), values);
      assert.deepEqual(arrayFrom(list2), values.slice(0, index).concat(['J', 'K']).concat(values.slice(index)));
    });
  });

  suite('#insertArrayMapped()', () => {
    const fn = (s: string, i: number) => `[${s}, ${i}]`;

    test('returns the same list if the value array is empty', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list1 = fromArrayMapped(fn, values);
      var list2 = insertArrayMapped(fn, 0, [], list1);
      assert.strictEqual(list1, list2);
      assert.deepEqual(arrayFrom(list2), values.map(fn));
    });

    test('appends to the list when using index === list.size', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var valuesToInsert = ['J', 'K'];
      var mappedValues = values.map(fn).concat(valuesToInsert.map(fn));
      var list1 = fromArrayMapped(fn, values);
      var list2 = insertArrayMapped(fn, list1._size, valuesToInsert, list1);
      assert.deepEqual(arrayFrom(list1), values.map(fn));
      assert.deepEqual(arrayFrom(list2), mappedValues);
    });

    test('prepends to the list when using index 0', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var valuesToInsert = ['J', 'K'];
      var mappedValues = valuesToInsert.map(fn).concat(values.map(fn));
      var list1 = fromArrayMapped(fn, values);
      var list2 = insertArrayMapped(fn, 0, valuesToInsert, list1);
      assert.deepEqual(arrayFrom(list2), mappedValues);
    });

    test('inserts the elements of the array in their respective order before the specified index', () => {
      var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var valuesToInsert = ['J', 'K'];
      var mappedValues = values.map(fn);
      mappedValues.splice(index, 0, ...valuesToInsert.map(fn));
      var list1 = fromArrayMapped(fn, values);
      var list2 = insertArrayMapped(fn, index, valuesToInsert, list1);
      assert.deepEqual(arrayFrom(list1), values.map(fn));
      assert.deepEqual(arrayFrom(list2), mappedValues);
    });
  });
});
