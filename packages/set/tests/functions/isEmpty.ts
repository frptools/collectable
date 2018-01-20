import test from 'ava';
import { empty, fromArray, isEmpty } from '../../src';

test('returns true if the set contains no items', t => {
  t.true(isEmpty(empty()));
});

test('returns false if the set contains one or more items', t => {
  t.false(isEmpty(fromArray(['A', 'B', 'C'])));
});
