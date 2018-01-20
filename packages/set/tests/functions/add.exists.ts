import test from 'ava';
import { HashSetStructure, add, fromArray, has, size } from '../../src';

let set0: HashSetStructure<string>, set1: HashSetStructure<string>;
test.before(() => {
  set0 = fromArray(['A', 'B', 'C']);
  set1 = add('B', set0);
});

test('when the item already exists in the set, the set size does not change', t => {
  t.is(size(set0), 3);
  t.is(size(set1), 3);
});

test('when the item already exists in the set, the input set is returned', t => {
  t.is(set0, set1);
});

test('when the item already exists in the set, the specified item can still be retrieved from the set', t => {
  t.true(has('B', set1));
});
