import test from 'ava';
import { HashSetStructure, fromArray, values } from '../../src';

let set: HashSetStructure<string>;
let set2: HashSetStructure<string>;
let set3: HashSetStructure<string>;

test.beforeEach(() => {
  set = fromArray(['A', 'B', 'C', 'D', 'E']);
  set3 = fromArray(['A', 'C', 'D', 'E', 'F']);
  set2 = fromArray(['B', 'E', 'C', 'A', 'D']);
});

test('Symbol.iterator() emits the same values as the values() function', t => {
  t.deepEqual(Array.from(set[Symbol.iterator]()).sort(), Array.from(values(set)).sort());
});

test('@@equals() returns true if both sets have an equivalent set of members', t => {
  t.true(set['@@equals'](set2));
});

test('@@equals() returns false if the sets have differing members from each other', t => {
  t.false(set['@@equals'](set3));
  t.false(set2['@@equals'](set3));
});