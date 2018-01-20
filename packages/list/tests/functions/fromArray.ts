import test from 'ava';
import { fromArray } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('should return an empty list if passed an empty array', t => {
  const list = fromArray([]);
  t.is(list._size, 0);
  t.true(list._left.isDefaultEmpty());
  t.true(list._right.isDefaultEmpty());
});

test('should return a list containing all the values in the array', t => {
  var values = makeValues(BRANCH_FACTOR >>> 1);
  t.deepEqual(arrayFrom(fromArray(values)), values);

  values = makeValues(BRANCH_FACTOR);
  t.deepEqual(arrayFrom(fromArray(values)), values);

  values = makeValues(BRANCH_FACTOR + 1);
  var list = fromArray(values);
  t.deepEqual(arrayFrom(list), values);

  values = makeValues(BRANCH_FACTOR*BRANCH_FACTOR);
  list = fromArray(values);
  t.deepEqual(arrayFrom(list), values);
});
