import test from 'ava';
import { SortedSetStructure, add, has, size } from '../../src';
import { fromStringArray } from '../test-utils';

let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
test.beforeEach(() => {
  set0 = fromStringArray(['D', 'A', 'B']);
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
