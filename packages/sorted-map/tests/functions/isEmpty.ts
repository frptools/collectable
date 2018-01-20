import test from 'ava';
import { empty, isEmpty } from '../../src';
import { fromStringArray } from '../test-utils';

test('returns true if the map contains no items', t => {
  t.true(isEmpty(empty()));
});

test('returns false if the map contains one or more items', t => {
  t.false(isEmpty(fromStringArray(['A', 'B', 'C'])));
});
