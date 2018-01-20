import test from 'ava';
import { empty, prepend } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should not mutate the original List', t => {
  const list = empty<string>();
  const prepended = prepend('foo', list);
  t.is(list._size, 0);
  t.is(list._left.slot.slots.length, 0);
  t.not(list, prepended);
  t.notDeepEqual(list, prepended);
});

test('should have size:1 after adding the first element', t => {
  const list = prepend('foo', empty<string>());
  t.is(list._size, 1);
  t.deepEqual(arrayFrom(list), ['foo']);
});

test('should have size:2 after adding the second element', t => {
  const list = prepend('bar', prepend('foo', empty<string>()));
  t.is(list._size, 2);
  t.deepEqual(arrayFrom(list), ['bar', 'foo']);
});
