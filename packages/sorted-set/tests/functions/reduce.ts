import test from 'ava';
import { SortedSetStructure as SortedSet, reduce } from '../../src';
import { fromStringArray } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let set: SortedSet<string>;
test.beforeEach(() => {
  set = fromStringArray(values);
});

test('does not modify the input set', t => {
  t.deepEqual(Array.from(set), values);
});

test('calls the predicate with an accumulator value, a set item and an iteration index, for each member of the input set', t => {
  let ii = 0, expected = 'X', remaining = new Set(values);
  reduce((s: string, c: string, i: number) => {
    t.is(i, ii++);
    t.true(remaining.has(c));
    remaining.delete(c);
    t.is(expected, s);
    s += c;
    expected = s;
    return s;
  }, expected, set);
  t.is(remaining.size, 0);
});

test('returns the value returned by the last predicate call', t => {
  let expected = 'X';
  const result = reduce((s: string, c: string, i: number) => {
    s += c;
    expected = s;
    return s;
  }, expected, set);
  t.is(expected, result);
});
