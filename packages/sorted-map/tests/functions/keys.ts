import test from 'ava';
import { empty, keys } from '../../src';
import { fromStringArray } from '../test-utils';

test('returns an empty iterable if the input list is empty', t => {
  const map = empty();
  t.true(keys(map).next().done);
});

test('returns an iterable that emits each member of the input map and then completes', t => {
  const map = fromStringArray(['A', 'B', 'C']);
  t.deepEqual(Array.from(keys(map)), ['A', 'B', 'C']);
});
