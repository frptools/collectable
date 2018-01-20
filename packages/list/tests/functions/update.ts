import test from 'ava';
import { modify } from '@collectable/core';
import { empty, fromArray, update } from '../../src';
import { arrayFrom } from '../../src/internals';

test('returns the same list if no changes are made to the specified value', t => {
  const list = fromArray(['X', { foo: 'bar' }, 123]);
  t.is(update(0, c => 'X', list), list);
  t.is(update(1, o => o, list), list);
  t.is(update(2, n => 123, list), list);
});

test('returns a new list if the new value is different to the existing value', t => {
  const list = fromArray(['X', { foo: 'bar' }, 123]);
  const list1 = update(0, c => 'K', list);
  const list2 = update(1, o => ({ foo: 'baz' }), list);
  const list3 = update(2, n => 42, list);
  t.not(list, list1);
  t.not(list, list2);
  t.not(list, list3);
  t.deepEqual(arrayFrom(list1), ['K', { foo: 'bar' }, 123]);
  t.deepEqual(arrayFrom(list2), ['X', { foo: 'baz' }, 123]);
  t.deepEqual(arrayFrom(list3), ['X', { foo: 'bar' }, 42]);
});

test('returns the same list, modified with the updated value, if the list was not currently frozen', t => {
  const list = modify(fromArray(['X', { foo: 'bar' }, 123]));
  const list1 = update(0, c => 'K', list);
  const list2 = update(1, o => ({ foo: 'baz' }), list);
  const list3 = update(2, n => 42, list);
  t.is(list, list1);
  t.is(list, list2);
  t.is(list, list3);
  t.deepEqual(arrayFrom(list), ['K', { foo: 'baz' }, 42]);
});

test('treats a negative index as an offset from the end of the list', t => {
  const list = fromArray(['X', { foo: 'bar' }, 123, 'xyz']);
  const list1 = update(-2, n => 42, list);
  t.deepEqual(arrayFrom(list1), ['X', { foo: 'bar' }, 42, 'xyz']);
});

test('throws an error if the index is out of range', t => {
  t.throws(() => update(0, c => 'X', empty()));
  t.throws(() => update(2, c => 'X', fromArray(['X', 'Y'])));
});
