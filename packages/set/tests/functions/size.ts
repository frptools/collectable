import test from 'ava';
import { empty, fromArray, size } from '../../src';

test('returns 0 for an empty set', t => {
  t.is(size(empty()), 0);
});

test('returns the number of items in a set', t => {
  t.is(size(fromArray(['A', 'B', 'C'])), 3);
});
