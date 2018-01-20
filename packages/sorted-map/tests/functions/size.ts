import test from 'ava';
import { empty, size } from '../../src';
import { fromStringArray } from '../test-utils';

test('returns 0 for an empty map', t => {
  t.is(size(empty()), 0);
});

test('returns the number of items in a map', t => {
  t.is(size(fromStringArray(['A', 'B', 'C'])), 3);
});
