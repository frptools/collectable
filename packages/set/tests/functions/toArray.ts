import test from 'ava';
import { HashSetStructure, empty, fromArray, toArray } from '../../src';

const values = ['A', 'B', 'C', 'D', 'E'];
let set: HashSetStructure<string>;
test.before(() => {
  set = fromArray(values);
});

test('returns an empty array if the set is empty', t => {
  t.is(toArray(empty()).length, 0);
});

test('returns an array containing each member of the input set', t => {
  t.deepEqual(toArray(set).sort(), values);
});
