import test from 'ava';
import { SortedSetStructure as SortedSet, empty, toNativeSet } from '../../src';
import { fromStringArray } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let set: SortedSet<string>;
test.beforeEach(() => {
  set = fromStringArray(values);
});

test('returns an empty set if the input set is empty', t => {
  t.is(toNativeSet(empty()).size, 0);
});

test('returns a native set containing each member of the input set', t => {
  t.deepEqual(Array.from(toNativeSet(set)), values);
});
