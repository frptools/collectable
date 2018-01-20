import test from 'ava';
import { appendArray, empty } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should return the original list if called with an empty list', t => {
  const list = empty<string>();
  const appended = appendArray([], list);
  t.is(list._size, 0);
  t.is(list, appended);
});

test('should append each element in the array', t => {
  var values = ['foo', 'bar', 'baz'];
  const list = appendArray(values, empty<string>());
  t.is(list._size, 3);
  t.deepEqual(arrayFrom(list), values);
});
