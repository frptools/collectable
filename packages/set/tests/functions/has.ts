import test from 'ava';
import { HashSetStructure, fromArray, has } from '../../src';

const values = ['A', 'B', 'C', 'D', 'E'];
let set: HashSetStructure<string>;
test.before(() => {
  set = fromArray(values);
});

test('returns true if the set contains the input item', t => {
  values.forEach(c => t.true(has(c, set)));
});

test('returns false if the set does not contain the input item', t => {
  t.false(has('a', set));
});
