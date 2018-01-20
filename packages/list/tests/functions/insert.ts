import test from 'ava';
import { fromArray, insert } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('appends to the list when using index === list.size', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var list1 = fromArray<any>(values);
  var list2 = insert(list1._size, 'J', list1);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), values.concat(['J']));
});

test('prepends to the list when using index 0', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var list1 = fromArray<any>(values);
  var list2 = insert(0, 'J', list1);
  t.deepEqual(arrayFrom(list2), ['J'].concat(values));
});

test('inserts the arguments in their respective order before the specified index', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  var list1 = fromArray<any>(values);
  var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
  var list2 = insert(index, 'J', list1);
  t.deepEqual(arrayFrom(list1), values);
  t.deepEqual(arrayFrom(list2), values.slice(0, index).concat(['J']).concat(values.slice(index)));
});
