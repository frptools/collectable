import test from 'ava';
import { SortedSetStructure, has } from '../../src';
import { fromStringArray } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let set: SortedSetStructure<string>;
test.before(() => {
  set = fromStringArray(values);
});

test('returns true if the set contains the input item', t => {
  values.forEach(c => t.true(has(c, set)));
});

test('returns false if the set does not contain the input item', t => {
  t.false(has('a', set));
});
