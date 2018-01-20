import test from 'ava';
import { HashSetStructure, empty, fromArray, toNativeSet } from '../../src';

const values = ['A', 'B', 'C', 'D', 'E'];
let set: HashSetStructure<string>;
test.before(() => {
  set = fromArray(values);
});

test('returns an empty set if the input set is empty', t => {
  t.is(toNativeSet(empty()).size, 0);
});

test('returns a native set containing each member of the input set', t => {
  t.deepEqual(Array.from(toNativeSet(set)).sort(), values);
});
