import test from 'ava';
import { empty, fromArray, prependArray, remove } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('returns an identical list if the index is out of bounds', t => {
  var values = makeValues(BRANCH_FACTOR*3);
  var list0 = fromArray(values);
  var list1 = remove(values.length, list0);
  var list2 = empty();
  var list3 = remove(1, list2);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length);
  t.is(list2._size, 0);
  t.is(list3._size, 0);
  t.deepEqual(arrayFrom(list0), arrayFrom(list1));
  t.deepEqual(arrayFrom(list2), arrayFrom(list3));
});

test('returns an empty list if the index points at the first element of a single-element list', t => {
  var list = remove(0, fromArray(['X']));
  t.is(list._size, 0);
  t.deepEqual(arrayFrom(list), []);
});

test('removes the specified index when the list has only one node', t => {
  var values = makeValues(BRANCH_FACTOR - 1);
  var list0 = fromArray(values);
  var list1 = remove(0, list0);
  var list2 = remove(1, list0);
  var list3 = remove(BRANCH_FACTOR - 2, list0);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length - 1);
  t.is(list2._size, values.length - 1);
  t.is(list3._size, values.length - 1);
  t.deepEqual(arrayFrom(list0), values);
  t.deepEqual(arrayFrom(list1), values.slice(1));
  t.deepEqual(arrayFrom(list2), values.slice(0, 1).concat(values.slice(2)));
  t.deepEqual(arrayFrom(list3), values.slice(0, values.length - 1));
});

test('removes the specified index when it is located at the head of the list', t => {
  var values = makeValues(BRANCH_FACTOR*3);
  var list0 = fromArray(values);
  var list1 = remove(0, list0);
  var list2 = remove(BRANCH_FACTOR >>> 1, list0);
  var list3 = remove(BRANCH_FACTOR - 1, list0);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length - 1);
  t.is(list2._size, values.length - 1);
  t.is(list3._size, values.length - 1);
  t.deepEqual(arrayFrom(list0), values);
  t.deepEqual(arrayFrom(list1), values.slice(1));
  t.deepEqual(arrayFrom(list2), values.slice(0, BRANCH_FACTOR >>> 1).concat(values.slice((BRANCH_FACTOR >>> 1) + 1)));
  t.deepEqual(arrayFrom(list3), values.slice(0, BRANCH_FACTOR - 1).concat(values.slice(BRANCH_FACTOR)));
});

test('removes the specified index when it is located at the tail of the list', t => {
  var values = makeValues(BRANCH_FACTOR*3);
  var list0 = fromArray(values);
  var list1 = remove(values.length - 1, list0);
  var list2 = remove(values.length - (BRANCH_FACTOR >>> 1), list0);
  var list3 = remove(values.length - BRANCH_FACTOR, list0);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length - 1);
  t.is(list2._size, values.length - 1);
  t.is(list3._size, values.length - 1);
  t.deepEqual(arrayFrom(list0), values);
  t.deepEqual(arrayFrom(list1), values.slice(0, values.length - 1));
  t.deepEqual(arrayFrom(list2), values.slice(0, values.length - (BRANCH_FACTOR >>> 1)).concat(values.slice(values.length - (BRANCH_FACTOR >>> 1) + 1)));
  t.deepEqual(arrayFrom(list3), values.slice(0, values.length - BRANCH_FACTOR).concat(values.slice(values.length - BRANCH_FACTOR + 1)));
});

test('removes the specified index when multi-level traversal would be required to find it', t => {
  var values = makeValues(BRANCH_FACTOR*4);
  var list0 = fromArray(values);
  var list1 = prependArray(values, empty());
  var list2 = remove(BRANCH_FACTOR + 2, list0);
  var list3 = remove(list1._size - BRANCH_FACTOR - 2, list1);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length);
  t.is(list2._size, values.length - 1);
  t.is(list3._size, values.length - 1);
  t.deepEqual(arrayFrom(list0), values);
  t.deepEqual(arrayFrom(list1), values.slice(0, values.length));
  t.deepEqual(arrayFrom(list2), values.slice(0, BRANCH_FACTOR + 2).concat(values.slice(BRANCH_FACTOR + 3)));
  t.deepEqual(arrayFrom(list3), values.slice(0, values.length - BRANCH_FACTOR - 2).concat(values.slice(values.length - BRANCH_FACTOR - 1)));
});
