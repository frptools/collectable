import test from 'ava';
import { SortedSetStructure, isEqual } from '../../src';
import { fromStringArray } from '../test-utils';

const values0 = ['A', 'B', 'C', 'D', 'E'];
const values2 = ['A', 'B', 'C', 'D'];
const values3 = ['x', 'A', 'B', 'C', 'D', 'E'];
let set0: SortedSetStructure<string>,
    set1: SortedSetStructure<string>,
    set2: SortedSetStructure<string>,
    set3: SortedSetStructure<string>;
test.before(() => {
  set0 = fromStringArray(values0);
  set1 = fromStringArray(values0.slice()); // ensure the implementation doesn't retain the same array internally
  set2 = fromStringArray(values2);
  set3 = fromStringArray(values3);
});

test('returns true if both inputs contain equivalent sets of items', t => {
  t.true(isEqual(set0, set1));
});

test('returns false if either input contains items that cannot be found in the other', t => {
  t.false(isEqual(set0, set2));
  t.false(isEqual(set1, set2));
  t.false(isEqual(set0, set3));
  t.false(isEqual(set1, set3));
  t.false(isEqual(set2, set3));
});
