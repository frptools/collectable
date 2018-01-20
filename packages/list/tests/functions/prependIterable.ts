import test from 'ava';
import { empty, prependIterable } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should return the original list if called with an empty iterable', t => {
  const list = empty<string>();
  const prepended = prependIterable(new Set(), list);
  t.is(list._size, 0);
  t.is(list, prepended);
});

test('should prepend each value iterated over', t => {
  var values = new Set(['foo', 'bar', 'baz']);
  const list = prependIterable(values, empty<string>());
  t.is(list._size, 3);
  t.deepEqual(arrayFrom(list).sort(), Array.from(values).sort());
});