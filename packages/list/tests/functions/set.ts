import test from 'ava';
import { empty, fromArray, set } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('throws an error if the index is out of range', t => {
  t.throws(() => set(0, 'X', empty<any>()));
  t.throws(() => set(2, 'Z', fromArray(['X', 'Y'])));
  t.throws(() => set(-3, 'Z', fromArray(['X', 'Y'])));
});

test('updates the value at the specified index', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list1 = fromArray<any>(values);
  var list2 = set(0, 'J', list1);
  list2 = set(2, 'K', list2);
  list2 = set(5, 'L', list2);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), ['J', 'B', 'K', 'X', 'Y', 'L']);

  values = makeValues(Math.pow(BRANCH_FACTOR, 3));
  var expected = values.slice();
  expected[0] = 'J';
  expected[BRANCH_FACTOR*2] = 'K';
  expected[expected.length - 1] = 'L';

  list1 = fromArray<any>(values);
  list2 = set(0, 'J', list1);
  list2 = set(BRANCH_FACTOR*2, 'K', list2);
  list2 = set(expected.length - 1, 'L', list2);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), expected);

  list1 = fromArray<any>(values);
  list2 = set(expected.length - 1, 'L', list1);
  list2 = set(BRANCH_FACTOR*2, 'K', list2);
  list2 = set(0, 'J', list2);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), expected);

  list1 = fromArray<any>(values);
  list2 = set(BRANCH_FACTOR*2, 'K', list1);
  list2 = set(expected.length - 1, 'L', list2);
  list2 = set(0, 'J', list2);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), expected);
});

test('updates the value at a location relative to the end of the list if the specified index is negative', t => {
  var list1 = fromArray<any>(['A', 'B', 'C', 'X', 'Y', 'Z']);
  var list2 = set(-2, 'J', list1);
  t.deepEqual(arrayFrom(list1), ['A', 'B', 'C', 'X', 'Y', 'Z']);
  t.deepEqual(arrayFrom(list2), ['A', 'B', 'C', 'X', 'J', 'Z']);
});
