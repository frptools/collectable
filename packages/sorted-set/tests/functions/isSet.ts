import test from 'ava';
import { emptyWithNumericKeys } from '@collectable/red-black-tree';
import { empty, isSortedSet } from '../../src';

test('returns true if the argument is an instance of a Collectable.js SortedSet class', t => {
  t.true(isSortedSet(empty()));
});

test('returns false if the argument is not an instance of a Collectable.js SortedSet class', t => {
  t.false(isSortedSet(emptyWithNumericKeys()));
});
