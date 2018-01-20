import test from 'ava';
import { empty, entries, set as setEntry } from '../../src';
import { fromStringArray, pairsFrom } from '../test-utils';

test('returns an empty iterable if the input list is empty', t => {
  const map = empty();
  t.true(entries(map).next().done);
});

test('returns an iterable that emits each member of the input map and then completes', t => {
  const map = fromStringArray(['A', 'B', 'C']);
  t.deepEqual(Array.from(entries(map)), pairsFrom(['A', 'B', 'C']));
});

test('items updated by key have up-to-date values when iterating', t => {
  let map = fromStringArray(['A', 'B', 'C']);
  map = setEntry('B', Math.PI, map);
  const pairs = pairsFrom(['A', 'B', 'C']);
  pairs[1][1] = Math.PI;
  t.deepEqual(Array.from(entries(map)), pairs);
});
