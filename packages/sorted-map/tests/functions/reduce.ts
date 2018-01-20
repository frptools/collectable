import test from 'ava';
import { reduce } from '../../src';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let map: SortedMap;

test.beforeEach(() => {
  map = fromStringArray(values);
});

test('does not modify the input map', t => {
  t.deepEqual(Array.from(map), pairsFrom(values));
});

test('calls the predicate with an accumulator value, a map item and an iteration index, for each member of the input map', t => {
  let ii = 0, expected = 'X', remaining = new Set(values);
  reduce((acc: string, v: string, k: string, i: number) => {
    t.is(i, ii++);
    t.true(remaining.has(k));
    remaining.delete(k);
    t.is(expected, acc);
    acc += k;
    expected = acc;
    return acc;
  }, expected, map);
  t.is(remaining.size, 0);
});

test('returns the value returned by the last predicate call', t => {
  let expected = 'X';
  const result = reduce((s: string, c: string, i: number) => {
    s += c;
    expected = s;
    return s;
  }, expected, map);
  t.is(expected, result);
});
