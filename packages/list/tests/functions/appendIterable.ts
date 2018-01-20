import test from 'ava';
import { appendIterable, empty } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should return the original list if called with an empty iterable', t => {
  const list = empty<string>();
  const appended = appendIterable(new Set(), list);
  t.is(list._size, 0);
  t.is(list, appended);
});

test('should append each value iterated over', t => {
  var values = new Set(['foo', 'bar', 'baz']);
  const list = appendIterable(values, empty<string>());
  t.is(list._size, 3);
  const a = arrayFrom(list).sort();
  const b = Array.from(values).sort();
  t.deepEqual(a, b);
});
