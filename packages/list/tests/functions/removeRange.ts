import test from 'ava';
import { empty, fromArray, prependArray, removeRange } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('returns an identical list if the index range is out of bounds', t => {
  var values = makeValues(BRANCH_FACTOR*3);
  var list0 = fromArray(values);
  var list1 = removeRange(values.length, values.length + 2, list0);
  var list2 = empty();
  var list3 = removeRange(1, 2, list2);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length);
  t.is(list2._size, 0);
  t.is(list3._size, 0);
  t.deepEqual(arrayFrom(list0), arrayFrom(list1));
  t.deepEqual(arrayFrom(list2), arrayFrom(list3));
});

test('returns an empty list if the index range is a superset of the list', t => {
  var list0 = fromArray(makeValues(BRANCH_FACTOR*3));
  var list1 = fromArray(makeValues(BRANCH_FACTOR >>> 1));
  t.is(removeRange(0, list0._size, list0)._size, 0);
  t.is(removeRange(0, list1._size, list1)._size, 0);
});

test('removes the specified index range when the list has only one node', t => {
  var values = makeValues(BRANCH_FACTOR - 1);
  var list0 = fromArray(values);
  var list1 = removeRange(0, 2, list0);
  var list2 = removeRange(1, 3, list0);
  var list3 = removeRange(values.length - 2, values.length, list0);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length - 2);
  t.is(list2._size, values.length - 2);
  t.is(list3._size, values.length - 2);
  t.deepEqual(arrayFrom(list0), values);
  t.deepEqual(arrayFrom(list1), values.slice(2));
  t.deepEqual(arrayFrom(list2), values.slice(0, 1).concat(values.slice(3)));
  t.deepEqual(arrayFrom(list3), values.slice(0, values.length - 2));
});

test('removes the specified index range when contained within the head of the list', t => {
  var values = makeValues(BRANCH_FACTOR*3);
  var list0 = fromArray(values);
  var list1 = removeRange(0, 2, list0);
  var list2 = removeRange(1, 3, list0);
  var list3 = removeRange(BRANCH_FACTOR - 2, BRANCH_FACTOR, list0);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length - 2);
  t.is(list2._size, values.length - 2);
  t.is(list3._size, values.length - 2);
  t.deepEqual(arrayFrom(list0), values);
  t.deepEqual(arrayFrom(list1), values.slice(2));
  t.deepEqual(arrayFrom(list2), values.slice(0, 1).concat(values.slice(3)));
  t.deepEqual(arrayFrom(list3), values.slice(0, BRANCH_FACTOR - 2).concat(values.slice(BRANCH_FACTOR)));
});

test('removes the specified index range when contained within the tail of the list', t => {
  var values = makeValues(BRANCH_FACTOR*3);
  var list0 = fromArray(values);
  var list1 = removeRange(values.length - 2, values.length, list0);
  var list2 = removeRange(values.length - (BRANCH_FACTOR >>> 1), values.length - (BRANCH_FACTOR >>> 1) + 2, list0);
  var list3 = removeRange(values.length - BRANCH_FACTOR, values.length - BRANCH_FACTOR + 2, list0);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length - 2);
  t.is(list2._size, values.length - 2);
  t.is(list3._size, values.length - 2);
  t.deepEqual(arrayFrom(list0), values);
  t.deepEqual(arrayFrom(list1), values.slice(0, values.length - 2));
  t.deepEqual(arrayFrom(list2), values.slice(0, values.length - (BRANCH_FACTOR >>> 1)).concat(values.slice(values.length - (BRANCH_FACTOR >>> 1) + 2)));
  t.deepEqual(arrayFrom(list3), values.slice(0, values.length - BRANCH_FACTOR).concat(values.slice(values.length - BRANCH_FACTOR + 2)));
});

test('removes the specified index range when it spans multiple leaf nodes', t => {
  var values = makeValues(BRANCH_FACTOR*4);
  var start = BRANCH_FACTOR + 2, end = BRANCH_FACTOR*2 + 2;
  var expected = values.slice(0, start).concat(values.slice(end));
  var list0 = fromArray(values);
  var list1 = prependArray(values, empty());
  var list2 = removeRange(start, end, list0);
  var list3 = removeRange(start, end, list1);

  t.is(list0._size, values.length);
  t.is(list1._size, values.length);
  t.is(list2._size, expected.length);
  t.is(list3._size, expected.length);
  t.deepEqual(arrayFrom(list0), values);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), expected);
  t.deepEqual(arrayFrom(list3), expected);
});