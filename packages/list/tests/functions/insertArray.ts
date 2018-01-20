import test from 'ava';
import { fromArray, insertArray } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('returns the same list if the value array is empty', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list1 = fromArray<any>(values);
  var list2 = insertArray(0, [], list1);
  t.is(list1, list2);
  t.deepEqual(arrayFrom(list2), values);
});

test('appends to the list when using index === list.size', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var list1 = fromArray<any>(values);
  var list2 = insertArray(list1._size, ['J', 'K'], list1);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), values.concat(['J', 'K']));
});

test('prepends to the list when using index 0', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var list1 = fromArray<any>(values);
  var list2 = insertArray(0, ['J', 'K'], list1);
  t.deepEqual(arrayFrom(list2), ['J', 'K'].concat(values));
});

test('inserts the elements of the array in their respective order before the specified index', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var list1 = fromArray<any>(values);
  var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
  var list2 = insertArray(index, ['J', 'K'], list1);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), values.slice(0, index).concat(['J', 'K']).concat(values.slice(index)));
});
