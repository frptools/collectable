import test from 'ava';
import { SortedSetStructure as SortedSet, empty, toArray } from '../../src';
import { fromStringArray } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let set: SortedSet<string>;
test.beforeEach(() => {
  set = fromStringArray(values);
});

test('returns an empty array if the set is empty', t => {
  t.is(toArray(empty()).length, 0);
});

test('returns an array containing each member of the input set', t => {
  t.deepEqual(toArray(set), values);
});
