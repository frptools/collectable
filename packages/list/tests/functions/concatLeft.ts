import test from 'ava';
import { concatLeft, empty, fromArray } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('should return an empty list if both lists are empty', t => {
  const list1 = empty(), list2 = empty();
  t.is(concatLeft(list1, list2)._size, 0);
});

test('should return the non-empty list when one list is empty', t => {
  const list1 = empty(), list2 = fromArray(['J', 'K']);
  t.is(concatLeft(list1, list2), list2);
  t.is(concatLeft(list2, list1), list2);
});

test('should return a new list containing all of the values in both lists', t => {
  var values1 = makeValues(2);
  var values2 = makeValues(BRANCH_FACTOR >>> 1);
  var values3 = makeValues((BRANCH_FACTOR << 1) + (BRANCH_FACTOR >>> 2));
  var list1 = fromArray(values1);
  var list2 = fromArray(values2);
  var list3 = fromArray(values3);
  var list4 = concatLeft(list2, list3);

  t.deepEqual(arrayFrom(concatLeft(list2, list1)), values1.concat(values2));
  t.deepEqual(arrayFrom(concatLeft(list1, list2)), values2.concat(values1));
  t.deepEqual(arrayFrom(concatLeft(list3, list2)), values2.concat(values3));
  t.deepEqual(arrayFrom(list4), values3.concat(values2));
  t.deepEqual(arrayFrom(concatLeft(concatLeft(list3, list2), list1)), values1.concat(values2).concat(values3));
  t.deepEqual(arrayFrom(concatLeft(list1, list4)), values3.concat(values2).concat(values1));
});
