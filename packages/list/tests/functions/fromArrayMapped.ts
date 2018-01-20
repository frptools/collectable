import test from 'ava';
import { fromArrayMapped } from '../../src';
import { arrayFrom } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

const fn = (s: string, i: number) => `[${s}, ${i}]`;

test('should return an empty list if passed an empty array', t => {
  const list = fromArrayMapped(fn, []);
  t.is(list._size, 0);
  t.true(list._left.isDefaultEmpty());
  t.true(list._right.isDefaultEmpty());
});

test('should return a list containing all the values in the array', t => {
  var values = makeValues(BRANCH_FACTOR >>> 1);
  var mappedValues = values.map(fn);
  t.deepEqual(arrayFrom(fromArrayMapped(fn, values)), mappedValues);

  values = makeValues(BRANCH_FACTOR);
  mappedValues = values.map(fn);
  t.deepEqual(arrayFrom(fromArrayMapped(fn, values)), mappedValues);

  values = makeValues(BRANCH_FACTOR + 1);
  mappedValues = values.map(fn);
  var list = fromArrayMapped(fn, values);
  t.deepEqual(arrayFrom(list), mappedValues);

  values = makeValues(BRANCH_FACTOR*BRANCH_FACTOR);
  mappedValues = values.map(fn);
  list = fromArrayMapped(fn, values);
  t.deepEqual(arrayFrom(list), mappedValues);
});
