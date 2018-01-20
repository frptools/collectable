import test from 'ava';
import { appendArrayMapped, empty } from '../../src';
import { arrayFrom } from '../../src/internals';

const fn = (s: string, i: number) => `[${s}, ${i}]`;

test('should return the original list if called with an empty list', t => {
  const list = empty<string>();
  const appended = appendArrayMapped(fn, [], list);
  t.is(list._size, 0);
  t.is(list, appended);
});

test('should append each element in the array', t => {
  const values = ['foo', 'bar', 'baz'];
  const mappedValues = values.map(fn);
  const list = appendArrayMapped(fn, values, empty<string>());
  t.is(list._size, 3);
  t.deepEqual(arrayFrom(list), mappedValues);
});
