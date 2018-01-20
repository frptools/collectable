import test from 'ava';
import { empty, isEmpty } from '../../src';
import { fromStringArray } from '../test-utils';

test('returns true if the set contains no items', t => {
  t.true(isEmpty(empty()));
});

test('returns false if the set contains one or more items', t => {
  t.false(isEmpty(fromStringArray(['A', 'B', 'C'])));
});
