import test from 'ava';
import { empty, isSortedMap } from '../../src';
import { empty as emptyMap } from '@collectable/map';

test('returns true if the argument is an instance of a Collectable.js SortedMap class', t => {
  t.true(isSortedMap(empty()));
});

test('returns false if the argument is not an instance of a Collectable.js SortedMap class', t => {
  t.false(isSortedMap(emptyMap()));
});
