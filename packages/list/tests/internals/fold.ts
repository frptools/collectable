import test from 'ava';
import { ListStructure, fromArray } from '../../src';
import { fold } from '../../src/internals';

const values = ['A', 'B', 'C', 'D', 'E'];
let list: ListStructure<string>;

test.beforeEach(() => {
  list = fromArray(values);
});

test('does not modify the input list', t => {
  t.deepEqual(Array.from(list).sort(), values);
});

test('calls the predicate with an accumulator value, a list item and an iteration index, for each member of the input list', t => {
  let ii = 0, expected = 'X', remaining = values.slice();
  fold((s: string, c: string, i: number) => {
    t.is(i, ii++);
    t.is(remaining.shift(), c);
    t.is(expected, s);
    s += c;
    expected = s;
    return s;
  }, expected, list);
  t.is(remaining.length, 0);
});

test('returns the value returned by the last predicate call', t => {
  let expected = 'X';
  const result = fold((s: string, c: string, i: number) => {
    s += c;
    expected = s;
    return s;
  }, expected, list);
  t.is(expected, result);
});
