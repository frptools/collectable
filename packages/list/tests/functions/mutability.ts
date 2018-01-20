import test from 'ava';
import { commit, modify } from '@collectable/core';
import { append, appendArray, fromArray, set, take } from '../../src';
import { arrayFrom } from '../../src/internals';

test('modifying should return the same list if already unfrozen', t => {
  const list = modify(fromArray(['X', 'Y', 'Z']));
  t.is(modify(list), list);
});

test('modifying should return a new list if frozen', t => {
  const list = fromArray(['X', 'Y', 'Z']);
  t.not(modify(list), list);
});

test('modifying should cause common operations to directly mutate the input list', t => {
  const values = ['X', 'Y', 'Z'];
  const list = modify(fromArray(values));
  const list1 = appendArray(['A', 'B', 'C', 'D', 'E', 'F'], list);
  const list2 = set(5, 'K', list);
  const list3 = take(6, list);
  t.is(list, list1);
  t.is(list, list2);
  t.is(list, list3);
  t.deepEqual(arrayFrom(list), ['X', 'Y', 'Z', 'A', 'B', 'K']);
});

test('committing should return the same list if already frozen', t => {
  const list = fromArray(['X', 'Y', 'Z']);
  t.is(commit(list), list);
});

test('committing should cause common operations to avoid mutating the input list', t => {
  const values = ['X', 'Y', 'Z'];
  const list = commit(modify(fromArray(values)));
  const list1 = append('K', list);
  const list2 = set(1, 'K', list);
  const list3 = take(2, list);
  t.not(list1, list);
  t.not(list2, list);
  t.not(list3, list);
  t.deepEqual(arrayFrom(list), values);
  t.deepEqual(arrayFrom(list1), values.concat('K'));
  t.deepEqual(arrayFrom(list2), [values[0], 'K', values[2]]);
  t.deepEqual(arrayFrom(list3), values.slice(0, 2));
});
