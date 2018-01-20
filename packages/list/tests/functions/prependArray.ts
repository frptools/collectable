import test from 'ava';
import { empty, prependArray } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should return the original list if called with an empty list', t => {
  const list = empty<string>();
  const prepended = prependArray([], list);
  t.is(list._size, 0);
  t.is(list, prepended);
});

test('should append elements so that their order in the list matches the source array', t => {
  var values = ['foo', 'bar', 'baz'];
  const list = prependArray(values, empty<string>());
  t.is(list._size, 3);
  t.deepEqual(arrayFrom(list), values);
});
