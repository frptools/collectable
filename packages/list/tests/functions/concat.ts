import test from 'ava';
import { alt, concat, empty, fromArray } from '../../src';
import { arrayFrom } from '../../src//internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('should return an empty list if both lists are empty', t => {
  const list1 = empty(), list2 = empty();
  t.is(concat(list1, list2)._size, 0);
});

test('should return the non-empty list when one list is empty', t => {
  const list1 = empty(), list2 = fromArray(['J', 'K']);
  t.is(concat(list1, list2), list2);
  t.is(concat(list2, list1), list2);
});

test('should return a new list containing all of the values in both lists', t => {
  var values1 = makeValues(2);
  var values2 = makeValues(BRANCH_FACTOR >>> 1);
  var values3 = makeValues((BRANCH_FACTOR << 1) + (BRANCH_FACTOR >>> 2));
  var list1 = fromArray(values1);
  var list2 = fromArray(values2);
  var list3 = fromArray(values3);
  var list4 = concat(list3, list2);

  t.deepEqual(arrayFrom(concat(list1, list2)), values1.concat(values2));
  t.deepEqual(arrayFrom(concat(list2, list1)), values2.concat(values1));
  t.deepEqual(arrayFrom(concat(list2, list3)), values2.concat(values3));
  t.deepEqual(arrayFrom(list4), values3.concat(values2));
  t.deepEqual(arrayFrom(concat(list1, concat(list2, list3))), values1.concat(values2.concat(values3)));
  t.deepEqual(arrayFrom(concat(list4, list1)), values3.concat(values2).concat(values1));
});

test('alt() is an alias for concat', t => {
  t.is(concat, alt);
});
