import test from 'ava';
import { concatAll, empty, fromArray } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('should return an empty list if all lists are empty', t => {
  const list1 = empty(), list2 = empty(), list3 = empty();
  t.is(concatAll([list1, list2, list3])._size, 0);
});

test('should return a new list containing all of the values in all lists', t => {
  var values1 = makeValues(2);
  var values2 = makeValues(BRANCH_FACTOR >>> 1);
  var values3 = makeValues((BRANCH_FACTOR << 1) + (BRANCH_FACTOR >>> 2));
  var list1 = fromArray(values1);
  var list2 = fromArray(values2);
  var list3 = fromArray(values3);

  t.deepEqual(arrayFrom(concatAll([list1, list2])), values1.concat(values2));
  t.deepEqual(arrayFrom(concatAll([list2, list1])), values2.concat(values1));
  t.deepEqual(arrayFrom(concatAll([list2, list3])), values2.concat(values3));
  t.deepEqual(arrayFrom(concatAll([list1, list2, list3])), values1.concat(values2.concat(values3)));
  t.deepEqual(arrayFrom(concatAll([list3, list2, list1])), values3.concat(values2).concat(values1));
});