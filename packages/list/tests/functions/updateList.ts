import test from 'ava';
import { isImmutable } from '@collectable/core';
import { appendArray, empty, set, updateList } from '../../src';
import { arrayFrom } from '../../src/internals';

// test('returns the same list if no changes are made', t => {
//   const list = empty<string>();
//   const list1 = updateList(list => {}, list);
//   t.is(list1, list);
// });

test('treats the inner list as mutable', t => {
  const list = empty<string>();
  const list1 = updateList(list => {
    t.false(isImmutable(list));
    appendArray(['X', 'Y', 'Z'], list);
    set(1, 'K', list);
  }, list);
  t.true(isImmutable(list1));
  t.deepEqual(arrayFrom(list1), ['X', 'K', 'Z']);
});
