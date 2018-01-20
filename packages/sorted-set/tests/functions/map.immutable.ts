import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure, map, size } from '../../src';
import { fromStringArray } from '../test-utils';

const toLower = (a: string) => a.toLowerCase();
const values = ['A', 'B', 'C', 'D', 'E'];
let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
test.beforeEach(() => {
  set0 = fromStringArray(values);
  set1 = map(toLower, set0);
});

test('the input set is not modified', t => {
  t.is(size(set0), values.length);
  t.true(isImmutable(set0));
  t.deepEqual(Array.from(set0), values);
});

test('a new immutable set is returned', t => {
  t.true(isImmutable(set1));
  t.not(set0, set1);
});

test('the size of the new set equals that of the input set', t => {
  t.is(size(set0), size(set1));
});

test('the predicate is called for each member of the input set', t => {
  let each: string[] = [];
  map(c => (each.push(c), c), set0);
  t.deepEqual(each, values);
});

test('the new set is populated by the predicate-transformed counterparts of each member of the input set', t => {
  t.deepEqual(Array.from(map(toLower, set1)), values.map(toLower));
});
