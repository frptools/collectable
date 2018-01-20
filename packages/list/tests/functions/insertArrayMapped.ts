import test from 'ava';
import { fromArrayMapped, insertArrayMapped } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

const fn = (s: string, i: number) => `[${s}, ${i}]`;

test('returns the same list if the value array is empty', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list1 = fromArrayMapped(fn, values);
  var list2 = insertArrayMapped(fn, 0, [], list1);
  t.is(list1, list2);
  t.deepEqual(arrayFrom(list2), values.map(fn));
});

test('appends to the list when using index === list.size', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var valuesToInsert = ['J', 'K'];
  var mappedValues = values.map(fn).concat(valuesToInsert.map(fn));
  var list1 = fromArrayMapped(fn, values);
  var list2 = insertArrayMapped(fn, list1._size, valuesToInsert, list1);
  t.deepEqual(arrayFrom(list1), values.map(fn));
  t.deepEqual(arrayFrom(list2), mappedValues);
});

test('prepends to the list when using index 0', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var valuesToInsert = ['J', 'K'];
  var mappedValues = valuesToInsert.map(fn).concat(values.map(fn));
  var list1 = fromArrayMapped(fn, values);
  var list2 = insertArrayMapped(fn, 0, valuesToInsert, list1);
  t.deepEqual(arrayFrom(list2), mappedValues);
});

test('inserts the elements of the array in their respective order before the specified index', t => {
  var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var valuesToInsert = ['J', 'K'];
  var mappedValues = values.map(fn);
  mappedValues.splice(index, 0, ...valuesToInsert.map(fn));
  var list1 = fromArrayMapped(fn, values);
  var list2 = insertArrayMapped(fn, index, valuesToInsert, list1);
  t.deepEqual(arrayFrom(list1), values.map(fn));
  t.deepEqual(arrayFrom(list2), mappedValues);
});
