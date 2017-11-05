import {assert} from 'chai';
import {fromArray, fromArrayMapped, of} from '../../src';
import {arrayFrom, getAtOrdinal} from '../../src/internals';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[List]', () => {
  suite('fromArray()', () => {
    test('should return an empty list if passed an empty array', () => {
      const list = fromArray([]);
      assert.strictEqual(list._size, 0);
      assert.isTrue(list._left.isDefaultEmpty());
      assert.isTrue(list._right.isDefaultEmpty());
    });

    test('should return a list containing all the values in the array', () => {
      var values = makeValues(BRANCH_FACTOR >>> 1);
      assert.deepEqual(arrayFrom(fromArray(values)), values);

      values = makeValues(BRANCH_FACTOR);
      assert.deepEqual(arrayFrom(fromArray(values)), values);

      values = makeValues(BRANCH_FACTOR + 1);
      var list = fromArray(values);
      assert.deepEqual(arrayFrom(list), values);

      values = makeValues(BRANCH_FACTOR*BRANCH_FACTOR);
      list = fromArray(values);
      assert.deepEqual(arrayFrom(list), values);
    });
  });

  suite('fromArrayMapped()', () => {
    const fn = (s: string, i: number) => `[${s}, ${i}]`;
    test('should return an empty list if passed an empty array', () => {
      const list = fromArrayMapped(fn, []);
      assert.strictEqual(list._size, 0);
      assert.isTrue(list._left.isDefaultEmpty());
      assert.isTrue(list._right.isDefaultEmpty());
    });

    test('should return a list containing all the values in the array', () => {
      var values = makeValues(BRANCH_FACTOR >>> 1);
      var mappedValues = values.map(fn);
      assert.deepEqual(arrayFrom(fromArrayMapped(fn, values)), mappedValues);

      values = makeValues(BRANCH_FACTOR);
      mappedValues = values.map(fn);
      assert.deepEqual(arrayFrom(fromArrayMapped(fn, values)), mappedValues);

      values = makeValues(BRANCH_FACTOR + 1);
      mappedValues = values.map(fn);
      var list = fromArrayMapped(fn, values);
      assert.deepEqual(arrayFrom(list), mappedValues);

      values = makeValues(BRANCH_FACTOR*BRANCH_FACTOR);
      mappedValues = values.map(fn);
      list = fromArrayMapped(fn, values);
      assert.deepEqual(arrayFrom(list), mappedValues);
    });
  });

  suite('of()', () => {
    test('should return a list containing the value', () => {
      var list = of('A');
      assert.strictEqual(getAtOrdinal(list, 0), 'A');
    });
  });
});