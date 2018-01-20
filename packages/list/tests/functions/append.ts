import test from 'ava';
import { append, empty } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should not mutate the original List', t => {
  const list = empty<string>();
  const appended = append('foo', list);
  t.is(list._size, 0);
  t.is(list._left.slot.slots.length, 0);
  t.not(list, appended);
  t.notDeepEqual(list, appended);
});

test('should have size:1 after adding the first element', t => {
  const list = append('foo', empty<string>());
  t.is(list._size, 1);
  t.deepEqual(arrayFrom(list), ['foo']);
});

test('should have size:2 after adding the second element', t => {
  const list = append('bar', append('foo', empty<string>()));
  t.is(list._size, 2);
  t.deepEqual(arrayFrom(list), ['foo', 'bar']);
});
