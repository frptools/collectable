import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure, map, size } from '../../src';
import { fromStringArray } from '../test-utils';

const toLower = (a: string) => a.toLowerCase();
const values = ['A', 'B', 'C', 'D', 'E'];
let set: SortedSetStructure<string>;
test.beforeEach(() => {
  set = modify(fromStringArray(values));
});

test('the input set is returned', t => {
  t.is(map(toLower, set), set);
});

test('the input set is still mutable', t => {
  map(toLower, set);
  t.true(isMutable(set));
});

test('the set size remains unchanged', t => {
  t.is(size(map(toLower, set)), values.length);
});

test('the predicate is called for each member of the input set', t => {
  let each: string[] = [];
  map(c => (each.push(c), c), set);
  t.deepEqual(each, values);
});

test('all members of the set are replaced by their transformed counterpart returned by the predicate', t => {
  t.deepEqual(Array.from(map(toLower, set)), values.map(toLower));
});
